import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

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

interface SecureSession {
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  csrfToken: string;
  sessionId: string;
  expiresAt: number;
}

class UnifiedAuthService {
  private sessionKey = 'secure_session';
  private maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours

  // Unified login for both teachers and students
  async secureLogin(credentials: {
    email?: string;
    fullName?: string;
    school: string;
    grade?: string;
    password: string;
    role?: 'teacher' | 'admin' | 'doctor';
    userType: 'teacher' | 'student';
  }): Promise<AuthResult> {
    try {
      // Enhanced rate limiting
      const rateLimitKey = `login_${credentials.email || credentials.fullName}_${credentials.userType}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 5, 300000)) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'rate_limit_exceeded',
          details: `Login rate limit exceeded for ${credentials.userType}`,
          severity: 'medium'
        });
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Input validation
      if (credentials.userType === 'teacher' && credentials.email) {
        const emailValidation = enhancedSecurityValidationService.validateEmail(credentials.email);
        if (!emailValidation.isValid) {
          return { success: false, error: emailValidation.errors.join(', ') };
        }
      }

      // Password validation
      const passwordValidation = enhancedSecurityValidationService.validatePassword(credentials.password);
      if (passwordValidation.riskLevel === 'high') {
        return { success: false, error: 'Password does not meet security requirements' };
      }

      let user: AuthUser | null = null;

      if (credentials.userType === 'teacher') {
        user = await this.authenticateTeacher(credentials.email!, credentials.password, credentials.role);
      } else {
        user = await this.authenticateStudent(
          credentials.fullName!,
          credentials.school,
          credentials.grade!,
          credentials.password
        );
      }

      if (user) {
        // Create secure session
        const session = await this.createSecureSession(user);
        this.storeSecureSession(session);

        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity', // Using valid enum value for success logging
          userId: user.id,
          details: `Successful ${credentials.userType} login`,
          severity: 'low'
        });

        return { success: true, user };
      } else {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'authentication_failure',
          details: `Failed ${credentials.userType} login attempt`,
          severity: 'medium'
        });
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'authentication_failure',
        details: `Login error: ${error}`,
        severity: 'high'
      });
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  private async authenticateTeacher(email: string, password: string, role?: string): Promise<AuthUser | null> {
    try {
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim());

      if (error || !teachers || teachers.length === 0) {
        return null;
      }

      const teacher = teachers[0];
      const isValidPassword = await enhancedSecurityValidationService.verifyPassword(password, teacher.password_hash);

      if (!isValidPassword) {
        return null;
      }

      return {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        school: teacher.school,
        role: teacher.role,
        userType: 'teacher'
      };
    } catch (error) {
      console.error('Teacher authentication error:', error);
      return null;
    }
  }

  private async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthUser | null> {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName.trim())
        .eq('school', school.trim())
        .eq('grade', grade.trim());

      if (error || !students || students.length === 0) {
        return null;
      }

      const student = students[0];
      const isValidPassword = await enhancedSecurityValidationService.verifyPassword(password, student.password_hash);

      if (!isValidPassword) {
        return null;
      }

      return {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        role: 'student',
        userType: 'student'
      };
    } catch (error) {
      console.error('Student authentication error:', error);
      return null;
    }
  }

  private async createSecureSession(user: AuthUser): Promise<SecureSession> {
    const sessionId = crypto.randomUUID();
    const csrfToken = enhancedSecurityValidationService.generateCSRFToken();
    
    return {
      userId: user.id,
      userType: user.userType,
      school: user.school,
      csrfToken,
      sessionId,
      expiresAt: Date.now() + this.maxSessionDuration
    };
  }

  private storeSecureSession(session: SecureSession): void {
    // Store in sessionStorage for better security (clears on tab close)
    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    
    // Also set secure fingerprint
    sessionStorage.setItem('sec_fp', this.generateFingerprint());
  }

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      canvas: canvas.toDataURL()
    }));
  }

  // Fix the getSecureSession method to be async where needed
  getSecureSession(): SecureSession | null {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (!stored) return null;

      const session: SecureSession = JSON.parse(stored);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.clearSecureSession();
        return null;
      }

      // Validate fingerprint
      const storedFingerprint = sessionStorage.getItem('sec_fp');
      const currentFingerprint = this.generateFingerprint();
      
      if (storedFingerprint !== currentFingerprint) {
        // Make this async call properly
        this.logSessionViolation(session.userId);
        this.clearSecureSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSecureSession();
      return null;
    }
  }

  // New helper method to handle async logging
  private async logSessionViolation(userId: string): Promise<void> {
    try {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        userId: userId,
        details: 'Session fingerprint mismatch detected',
        severity: 'high'
      });
    } catch (error) {
      console.error('Failed to log session violation:', error);
    }
  }

  async refreshSession(): Promise<boolean> {
    const session = this.getSecureSession();
    if (!session) return false;

    try {
      // Extend session
      session.expiresAt = Date.now() + this.maxSessionDuration;
      session.csrfToken = enhancedSecurityValidationService.generateCSRFToken();
      
      this.storeSecureSession(session);
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  clearSecureSession(): void {
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem('sec_fp');
    sessionStorage.removeItem('sec_ua');
    sessionStorage.removeItem('last_activity');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = this.getSecureSession();
    if (!session) return null;

    try {
      if (session.userType === 'teacher') {
        const { data: teachers } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', session.userId)
          .single();

        if (teachers) {
          return {
            id: teachers.id,
            email: teachers.email,
            name: teachers.name,
            school: teachers.school,
            role: teachers.role,
            userType: 'teacher'
          };
        }
      } else {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.userId)
          .single();

        if (students) {
          return {
            id: students.id,
            fullName: students.full_name,
            school: students.school,
            role: 'student',
            userType: 'student'
          };
        }
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }

    return null;
  }

  // Enhanced signup with security validation
  async secureSignup(data: {
    userType: 'teacher' | 'student';
    name?: string;
    fullName?: string;
    email?: string;
    school: string;
    grade?: string;
    role?: string;
    password: string;
  }): Promise<AuthResult> {
    try {
      // Rate limiting
      const rateLimitKey = `signup_${data.email || data.fullName}_${data.userType}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 3, 300000)) {
        return { success: false, error: 'Too many signup attempts. Please try again later.' };
      }

      // Enhanced password validation
      const passwordValidation = enhancedSecurityValidationService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Hash password securely
      const passwordHash = await enhancedSecurityValidationService.hashPassword(data.password);

      if (data.userType === 'teacher' && data.email) {
        const { data: newTeacher, error } = await supabase
          .from('teachers')
          .insert({
            name: data.name!,
            email: data.email.toLowerCase().trim(),
            school: data.school,
            role: data.role || 'teacher',
            password_hash: passwordHash
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: 'Failed to create account. Email may already exist.' };
        }

        return {
          success: true,
          user: {
            id: newTeacher.id,
            email: newTeacher.email,
            name: newTeacher.name,
            school: newTeacher.school,
            role: newTeacher.role,
            userType: 'teacher'
          }
        };
      } else {
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert({
            full_name: data.fullName!,
            school: data.school,
            grade: data.grade!,
            password_hash: passwordHash
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: 'Failed to create account. User may already exist.' };
        }

        return {
          success: true,
          user: {
            id: newStudent.id,
            fullName: newStudent.full_name,
            school: newStudent.school,
            role: 'student',
            userType: 'student'
          }
        };
      }
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'authentication_failure',
        details: `Signup error: ${error}`,
        severity: 'medium'
      });
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }
}

export const unifiedAuthService = new UnifiedAuthService();
