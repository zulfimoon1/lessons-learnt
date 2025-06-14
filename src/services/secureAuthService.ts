
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from './enhancedSecurityService';

export interface SecureLoginResult {
  success: boolean;
  user?: any;
  error?: string;
  rateLimited?: boolean;
  lockoutUntil?: number;
}

export interface SecureSignupData {
  name: string;
  email: string;
  password: string;
  school: string;
  role?: string;
  specialization?: string;
}

class SecureAuthService {
  async teacherLogin(email: string, password: string): Promise<SecureLoginResult> {
    const userAgent = navigator.userAgent;
    
    // Sanitize inputs
    const sanitizedEmail = enhancedSecurityService.sanitizeInput(email.toLowerCase().trim());
    
    // Validate email format
    if (!enhancedSecurityService.validateEmail(sanitizedEmail)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check rate limiting
    const rateLimit = enhancedSecurityService.checkRateLimit(sanitizedEmail);
    if (!rateLimit.allowed) {
      return { 
        success: false, 
        error: 'Too many failed attempts', 
        rateLimited: true,
        lockoutUntil: rateLimit.lockoutUntil 
      };
    }

    try {
      console.log('🔐 Attempting secure teacher login for:', sanitizedEmail);

      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', sanitizedEmail)
        .single();

      if (error || !teacher) {
        enhancedSecurityService.recordLoginAttempt(sanitizedEmail, false, userAgent);
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, teacher.password_hash);
      if (!passwordMatch) {
        enhancedSecurityService.recordLoginAttempt(sanitizedEmail, false, userAgent);
        return { success: false, error: 'Invalid credentials' };
      }

      // Successful login
      enhancedSecurityService.recordLoginAttempt(sanitizedEmail, true, userAgent);
      enhancedSecurityService.startSession();

      // Store encrypted user data
      const encryptedUser = enhancedSecurityService.encryptSensitiveData(JSON.stringify({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
        specialization: teacher.specialization,
        loginTime: Date.now()
      }));

      localStorage.setItem('teacher', encryptedUser);

      console.log('✅ Secure teacher login successful');
      return { success: true, user: teacher };

    } catch (error) {
      console.error('❌ Secure teacher login error:', error);
      enhancedSecurityService.recordLoginAttempt(sanitizedEmail, false, userAgent);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async studentLogin(fullName: string, school: string, grade: string, password: string): Promise<SecureLoginResult> {
    const userAgent = navigator.userAgent;
    
    // Sanitize inputs
    const sanitizedName = enhancedSecurityService.sanitizeInput(fullName.trim());
    const sanitizedSchool = enhancedSecurityService.sanitizeInput(school.trim());
    const sanitizedGrade = enhancedSecurityService.sanitizeInput(grade.trim());
    
    const identifier = `${sanitizedName}-${sanitizedSchool}-${sanitizedGrade}`;

    // Check rate limiting
    const rateLimit = enhancedSecurityService.checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      return { 
        success: false, 
        error: 'Too many failed attempts', 
        rateLimited: true,
        lockoutUntil: rateLimit.lockoutUntil 
      };
    }

    try {
      console.log('🔐 Attempting secure student login for:', sanitizedName);

      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', sanitizedName)
        .eq('school', sanitizedSchool)
        .eq('grade', sanitizedGrade)
        .single();

      if (error || !student) {
        enhancedSecurityService.recordLoginAttempt(identifier, false, userAgent);
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, student.password_hash);
      if (!passwordMatch) {
        enhancedSecurityService.recordLoginAttempt(identifier, false, userAgent);
        return { success: false, error: 'Invalid credentials' };
      }

      // Successful login
      enhancedSecurityService.recordLoginAttempt(identifier, true, userAgent);
      enhancedSecurityService.startSession();

      // Store encrypted user data
      const encryptedUser = enhancedSecurityService.encryptSensitiveData(JSON.stringify({
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade,
        loginTime: Date.now()
      }));

      localStorage.setItem('student', encryptedUser);

      console.log('✅ Secure student login successful');
      return { success: true, user: student };

    } catch (error) {
      console.error('❌ Secure student login error:', error);
      enhancedSecurityService.recordLoginAttempt(identifier, false, userAgent);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async teacherSignup(signupData: SecureSignupData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password strength
      const passwordValidation = enhancedSecurityService.validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        };
      }

      // Sanitize inputs
      const sanitizedData = {
        name: enhancedSecurityService.sanitizeInput(signupData.name.trim()),
        email: enhancedSecurityService.sanitizeInput(signupData.email.toLowerCase().trim()),
        school: enhancedSecurityService.sanitizeInput(signupData.school.trim()),
        role: signupData.role || 'teacher',
        specialization: signupData.specialization ? enhancedSecurityService.sanitizeInput(signupData.specialization.trim()) : undefined,
      };

      // Validate email
      if (!enhancedSecurityService.validateEmail(sanitizedData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Hash password with higher cost factor for security
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);

      const { error } = await supabase
        .from('teachers')
        .insert([{
          name: sanitizedData.name,
          email: sanitizedData.email,
          school: sanitizedData.school,
          role: sanitizedData.role,
          specialization: sanitizedData.specialization,
          password_hash: hashedPassword,
        }]);

      if (error) {
        console.error('❌ Teacher signup error:', error);
        if (error.code === '23505') {
          return { success: false, error: 'Email already registered' };
        }
        return { success: false, error: 'Signup failed. Please try again.' };
      }

      console.log('✅ Secure teacher signup successful');
      return { success: true };

    } catch (error) {
      console.error('❌ Teacher signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  getCurrentUser(): any | null {
    try {
      const teacherData = localStorage.getItem('teacher');
      const studentData = localStorage.getItem('student');
      
      if (teacherData) {
        const decryptedData = enhancedSecurityService.decryptSensitiveData(teacherData);
        return JSON.parse(decryptedData);
      }
      
      if (studentData) {
        const decryptedData = enhancedSecurityService.decryptSensitiveData(studentData);
        return JSON.parse(decryptedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  logout(): void {
    enhancedSecurityService.endSession();
    console.log('🔐 Secure logout completed');
  }
}

export const secureAuthService = new SecureAuthService();

// Export the specific functions that enhancedAuthService needs
export const secureTeacherLogin = secureAuthService.teacherLogin.bind(secureAuthService);
export const secureTeacherSignup = secureAuthService.teacherSignup.bind(secureAuthService);
export const secureStudentLogin = secureAuthService.studentLogin.bind(secureAuthService);
export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  // Implementation for student signup would go here
  return { success: false, error: 'Student signup not implemented yet' };
};
