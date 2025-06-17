
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword, validatePasswordStrength } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { secureSessionService } from './secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface LoginCredentials {
  email?: string;
  fullName?: string;
  school: string;
  grade?: string;
  password: string;
  role?: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface SignupCredentials {
  userType: 'teacher' | 'student';
  name?: string;
  fullName?: string;
  email?: string;
  school: string;
  grade?: string;
  role?: string;
  password: string;
}

interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Enhanced client-side rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkClientRateLimit = (identifier: string): { allowed: boolean; message?: string } => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (attempts) {
    if (attempts.blocked && now - attempts.lastAttempt < LOCKOUT_DURATION) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60);
      return { 
        allowed: false, 
        message: `Account temporarily locked. Try again in ${remainingTime} minutes.` 
      };
    }
    
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(identifier);
    }
  }
  
  return { allowed: true };
};

const recordFailedAttempt = (identifier: string) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
  attempts.count++;
  attempts.lastAttempt = now;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blocked = true;
  }
  
  loginAttempts.set(identifier, attempts);
};

const clearFailedAttempts = (identifier: string) => {
  loginAttempts.delete(identifier);
};

class ConsolidatedAuthService {
  async secureLogin(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const identifier = credentials.email || `${credentials.fullName}-${credentials.school}`;
      
      // Client-side rate limiting check
      const clientRateCheck = checkClientRateLimit(identifier);
      if (!clientRateCheck.allowed) {
        logUserSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: `Rate limit exceeded: ${identifier}`,
          userAgent: navigator.userAgent
        });
        return { success: false, error: clientRateCheck.message };
      }

      console.log(`🔐 Consolidated auth login attempt for ${credentials.userType}:`, { identifier, userType: credentials.userType });

      if (credentials.userType === 'teacher' || credentials.userType === 'admin') {
        return await this.authenticateTeacher(credentials);
      } else {
        return await this.authenticateStudent(credentials);
      }
    } catch (error) {
      console.error('Consolidated auth login error:', error);
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Login system error: ${error}`,
        userAgent: navigator.userAgent
      });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  private async authenticateTeacher(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      if (!credentials.email) {
        return { success: false, error: 'Email is required for teacher login' };
      }

      // Enhanced input validation
      const emailValidation = validateInput.validateEmail(credentials.email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.message };
      }

      const sanitizedEmail = emailValidation.sanitizedValue;
      console.log('🔍 Looking up teacher/admin:', sanitizedEmail);

      // Direct database query for teachers/admins
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('id, name, email, school, role, password_hash')
        .eq('email', sanitizedEmail)
        .limit(1);

      if (error || !teachers || teachers.length === 0) {
        console.log('❌ Teacher/admin not found:', error);
        recordFailedAttempt(sanitizedEmail);
        return { success: false, error: 'Invalid credentials' };
      }

      const teacher = teachers[0];
      console.log('✅ Teacher/admin found:', { id: teacher.id, email: teacher.email, role: teacher.role });

      // Verify password
      const isPasswordValid = await verifyPassword(credentials.password, teacher.password_hash);
      if (!isPasswordValid) {
        console.log('❌ Invalid password for teacher/admin');
        recordFailedAttempt(sanitizedEmail);
        return { success: false, error: 'Invalid credentials' };
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(sanitizedEmail);

      // Create secure session
      const userType = teacher.role === 'admin' ? 'admin' : 'teacher';
      secureSessionService.createSecureSession(teacher.id, userType as any, teacher.school);

      console.log(`✅ ${userType} login successful:`, teacher.email);

      logUserSecurityEvent({
        type: 'login_success',
        userId: teacher.id,
        timestamp: new Date().toISOString(),
        details: `Successful ${userType} login: ${teacher.email}`,
        userAgent: navigator.userAgent
      });

      return {
        success: true,
        user: {
          id: teacher.id,
          email: teacher.email,
          name: teacher.name,
          school: teacher.school,
          role: teacher.role,
          userType: userType as any
        }
      };
    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  private async authenticateStudent(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      if (!credentials.fullName || !credentials.grade) {
        return { success: false, error: 'Full name and grade are required for student login' };
      }

      // Enhanced input validation
      const nameValidation = validateInput.validateName(credentials.fullName);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.message };
      }

      const schoolValidation = validateInput.validateSchool(credentials.school);
      if (!schoolValidation.isValid) {
        return { success: false, error: schoolValidation.message };
      }

      const gradeValidation = validateInput.validateGrade(credentials.grade);
      if (!gradeValidation.isValid) {
        return { success: false, error: gradeValidation.message };
      }

      // Sanitize inputs
      const sanitizedName = nameValidation.sanitizedValue;
      const sanitizedSchool = schoolValidation.sanitizedValue;
      const sanitizedGrade = gradeValidation.sanitizedValue;

      const identifier = `${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`;
      console.log('🔍 Looking up student:', { fullName: sanitizedName, school: sanitizedSchool, grade: sanitizedGrade });

      // Direct database query for students
      const { data: students, error } = await supabase
        .from('students')
        .select('id, full_name, school, grade, password_hash')
        .eq('full_name', sanitizedName)
        .eq('school', sanitizedSchool)
        .eq('grade', sanitizedGrade)
        .limit(1);

      if (error || !students || students.length === 0) {
        console.log('❌ Student not found');
        recordFailedAttempt(identifier);
        return { success: false, error: 'Invalid credentials' };
      }

      const student = students[0];
      console.log('✅ Student found:', { id: student.id, fullName: student.full_name });

      // Verify password
      const isPasswordValid = await verifyPassword(credentials.password, student.password_hash);
      if (!isPasswordValid) {
        console.log('❌ Invalid password for student');
        recordFailedAttempt(identifier);
        return { success: false, error: 'Invalid credentials' };
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(identifier);

      // Create secure session
      secureSessionService.createSecureSession(student.id, 'student', student.school);

      console.log('✅ Student login successful:', student.full_name);

      logUserSecurityEvent({
        type: 'login_success',
        userId: student.id,
        timestamp: new Date().toISOString(),
        details: `Successful student login: ${student.full_name}`,
        userAgent: navigator.userAgent
      });

      return {
        success: true,
        user: {
          id: student.id,
          fullName: student.full_name,
          school: student.school,
          role: 'student',
          userType: 'student'
        }
      };
    } catch (error) {
      console.error('Student authentication error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  async secureSignup(credentials: SignupCredentials): Promise<AuthResult> {
    try {
      // Password strength validation
      const passwordValidation = validatePasswordStrength(credentials.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] || 'Password does not meet requirements' };
      }

      // Hash password securely
      const passwordHash = await hashPassword(credentials.password);

      if (credentials.userType === 'teacher' && credentials.email) {
        // Enhanced input validation for teacher
        const emailValidation = validateInput.validateEmail(credentials.email);
        if (!emailValidation.isValid) {
          return { success: false, error: emailValidation.message };
        }

        const nameValidation = validateInput.validateName(credentials.name!);
        if (!nameValidation.isValid) {
          return { success: false, error: nameValidation.message };
        }

        const schoolValidation = validateInput.validateSchool(credentials.school);
        if (!schoolValidation.isValid) {
          return { success: false, error: schoolValidation.message };
        }

        // Check if teacher already exists
        const { data: existingTeacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('email', emailValidation.sanitizedValue)
          .limit(1);

        if (existingTeacher && existingTeacher.length > 0) {
          return { success: false, error: 'Teacher already exists with this email' };
        }

        const { data: teacher, error } = await supabase
          .from('teachers')
          .insert([{
            name: nameValidation.sanitizedValue,
            email: emailValidation.sanitizedValue,
            school: schoolValidation.sanitizedValue,
            role: credentials.role || 'teacher',
            password_hash: passwordHash
          }])
          .select()
          .single();

        if (error) {
          console.error('Teacher signup error:', error);
          return { success: false, error: 'Failed to create teacher account' };
        }

        return {
          success: true,
          user: {
            id: teacher.id,
            email: teacher.email,
            name: teacher.name,
            school: teacher.school,
            role: teacher.role,
            userType: 'teacher'
          }
        };
      } else {
        // Enhanced input validation for student
        const nameValidation = validateInput.validateName(credentials.fullName!);
        if (!nameValidation.isValid) {
          return { success: false, error: nameValidation.message };
        }

        const schoolValidation = validateInput.validateSchool(credentials.school);
        if (!schoolValidation.isValid) {
          return { success: false, error: schoolValidation.message };
        }

        const gradeValidation = validateInput.validateGrade(credentials.grade!);
        if (!gradeValidation.isValid) {
          return { success: false, error: gradeValidation.message };
        }

        // Check if student already exists
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('full_name', nameValidation.sanitizedValue)
          .eq('school', schoolValidation.sanitizedValue)
          .eq('grade', gradeValidation.sanitizedValue)
          .limit(1);

        if (existingStudent && existingStudent.length > 0) {
          return { success: false, error: 'Student already exists with these details' };
        }

        const { data: student, error } = await supabase
          .from('students')
          .insert([{
            full_name: nameValidation.sanitizedValue,
            school: schoolValidation.sanitizedValue,
            grade: gradeValidation.sanitizedValue,
            password_hash: passwordHash
          }])
          .select()
          .single();

        if (error) {
          console.error('Student signup error:', error);
          return { success: false, error: 'Failed to create student account' };
        }

        return {
          success: true,
          user: {
            id: student.id,
            fullName: student.full_name,
            school: student.school,
            role: 'student',
            userType: 'student'
          }
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  getCurrentUser(): AuthUser | null {
    const session = secureSessionService.getSecureSession();
    if (!session) return null;

    // Return user data from session
    return {
      id: session.userId,
      school: session.school,
      role: session.userType,
      userType: session.userType
    } as AuthUser;
  }

  isAuthenticated(): boolean {
    const session = secureSessionService.getSecureSession();
    return session !== null;
  }

  logout(): void {
    secureSessionService.clearSession();
  }
}

export const consolidatedAuthService = new ConsolidatedAuthService();
