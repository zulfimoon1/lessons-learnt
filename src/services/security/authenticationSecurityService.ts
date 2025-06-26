
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '../securityService';
import bcrypt from 'bcryptjs';

interface AuthResult {
  teacher?: any;
  student?: any;
  error?: string;
  requiresMFA?: boolean;
}

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}

class AuthenticationSecurityService {
  private rateLimits = new Map<string, RateLimitEntry>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Clean up expired rate limits periodically
    setInterval(() => this.cleanupRateLimits(), this.CLEANUP_INTERVAL);
  }

  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimits.entries()) {
      if (now - entry.lastAttempt > this.BLOCK_DURATION) {
        this.rateLimits.delete(key);
      }
    }
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(identifier);

    if (!entry) {
      this.rateLimits.set(identifier, { attempts: 1, lastAttempt: now, blocked: false });
      return true;
    }

    // Reset if block duration has passed
    if (now - entry.lastAttempt > this.BLOCK_DURATION) {
      this.rateLimits.set(identifier, { attempts: 1, lastAttempt: now, blocked: false });
      return true;
    }

    if (entry.blocked) {
      return false;
    }

    entry.attempts++;
    entry.lastAttempt = now;

    if (entry.attempts >= this.MAX_ATTEMPTS) {
      entry.blocked = true;
      console.warn(`Rate limit exceeded for ${identifier}`);
      return false;
    }

    return true;
  }

  private resetRateLimit(identifier: string): void {
    this.rateLimits.delete(identifier);
  }

  // New method to support the enhanced security service interface
  async authenticateUser(
    userType: 'student' | 'teacher' | 'admin',
    credentials: any,
    requestContext: {
      userAgent: string;
      ipAddress?: string;
    }
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      if (userType === 'teacher') {
        const result = await this.authenticateTeacher(credentials.email, credentials.password);
        return {
          success: !result.error,
          user: result.teacher,
          error: result.error
        };
      } else if (userType === 'student') {
        const result = await this.authenticateStudent(
          credentials.fullName,
          credentials.school,
          credentials.grade,
          credentials.password
        );
        return {
          success: !result.error,
          user: result.student,
          error: result.error
        };
      }
      
      return { success: false, error: 'Unsupported user type' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async authenticateTeacher(email: string, password: string): Promise<AuthResult> {
    try {
      const identifier = `teacher_${email}`;
      
      if (!this.checkRateLimit(identifier)) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Input validation
      const emailValidation = securityService.validateAndSanitizeInput(email, 'email');
      if (!emailValidation.isValid) {
        return { error: 'Invalid email format' };
      }

      if (!password || password.length < 4) {
        return { error: 'Password is required' };
      }

      // Use secure authentication function
      const { data, error } = await supabase.rpc('authenticate_teacher_working', {
        email_param: emailValidation.sanitized,
        password_param: password
      });

      if (error || !data || data.length === 0 || !data[0].password_valid) {
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Teacher login failed for ${email}`,
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      // Reset rate limit on successful login
      this.resetRateLimit(identifier);

      const teacherData = data[0];
      return {
        teacher: {
          id: teacherData.teacher_id,
          name: teacherData.teacher_name,
          email: teacherData.teacher_email,
          school: teacherData.teacher_school,
          role: teacherData.teacher_role
        }
      };

    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { error: 'Authentication service unavailable' };
    }
  }

  async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    try {
      const identifier = `student_${fullName}_${school}`;
      
      if (!this.checkRateLimit(identifier)) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' };
      }

      // Input validation
      const nameValidation = securityService.validateAndSanitizeInput(fullName, 'name');
      const schoolValidation = securityService.validateAndSanitizeInput(school, 'school');
      
      if (!nameValidation.isValid || !schoolValidation.isValid) {
        return { error: 'Invalid input provided' };
      }

      if (!password || password.length < 4) {
        return { error: 'Password is required' };
      }

      // Use secure authentication function
      const { data, error } = await supabase.rpc('authenticate_student_working', {
        name_param: nameValidation.sanitized,
        school_param: schoolValidation.sanitized,
        grade_param: grade.trim(),
        password_param: password
      });

      if (error || !data || data.length === 0 || !data[0].password_valid) {
        securityService.logSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: `Student login failed for ${fullName} at ${school}`,
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      // Reset rate limit on successful login
      this.resetRateLimit(identifier);

      const studentData = data[0];
      return {
        student: {
          id: studentData.student_id,
          full_name: studentData.student_name,
          school: studentData.student_school,
          grade: studentData.student_grade
        }
      };

    } catch (error) {
      console.error('Student authentication error:', error);
      return { error: 'Authentication service unavailable' };
    }
  }

  // Cleanup method required by other services
  cleanup(): void {
    this.cleanupRateLimits();
    console.log('Authentication security service cleaned up');
  }
}

export const authenticationSecurityService = new AuthenticationSecurityService();
