
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

class SecureAuthenticationService {
  // Secure password hashing with proper salt rounds
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Industry standard for security
    return await bcrypt.hash(password, saltRounds);
  }

  // Secure password verification
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // Enhanced password strength validation - standardized to 12+ characters
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting check
  private rateLimitStore = new Map<string, { count: number; lastAttempt: number }>();
  
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const key = `auth_${identifier}`;
    const record = this.rateLimitStore.get(key);
    
    if (!record) {
      this.rateLimitStore.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - record.lastAttempt > windowMs) {
      this.rateLimitStore.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      return false;
    }
    
    // Increment counter
    record.count++;
    record.lastAttempt = now;
    return true;
  }

  // Secure admin authentication with enhanced validation
  async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Rate limiting
      if (!this.checkRateLimit(email)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Validate password strength for security awareness
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        console.warn('Weak password attempt for admin:', email);
        // Continue with authentication but log the warning
      }

      // Query database for admin user
      const { data: adminData, error: queryError } = await supabase
        .from('teachers')
        .select('id, name, email, school, role, password_hash')
        .eq('email', email.toLowerCase().trim())
        .eq('role', 'admin')
        .single();

      if (queryError || !adminData) {
        console.warn('Admin login attempt failed - user not found:', email);
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password against stored hash
      const isPasswordValid = await this.verifyPassword(password, adminData.password_hash);
      
      if (!isPasswordValid) {
        console.warn('Admin login attempt failed - invalid password:', email);
        return { success: false, error: 'Invalid credentials' };
      }

      // Log successful authentication
      console.log('Admin authenticated successfully:', email);
      return {
        success: true,
        user: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          school: adminData.school,
          role: adminData.role
        }
      };

    } catch (error) {
      console.error('Admin authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  // Secure teacher authentication with enhanced validation
  async authenticateTeacher(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Rate limiting
      if (!this.checkRateLimit(email)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      const { data: teacherData, error: queryError } = await supabase
        .from('teachers')
        .select('id, name, email, school, role, password_hash')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (queryError || !teacherData) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isPasswordValid = await this.verifyPassword(password, teacherData.password_hash);
      
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: teacherData.id,
          email: teacherData.email,
          name: teacherData.name,
          school: teacherData.school,
          role: teacherData.role
        }
      };

    } catch (error) {
      console.error('Teacher authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  // Secure student authentication with enhanced validation
  async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    try {
      if (!fullName || !school || !grade || !password) {
        return { success: false, error: 'All fields are required' };
      }

      // Rate limiting
      const identifier = `${fullName}_${school}_${grade}`;
      if (!this.checkRateLimit(identifier)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      const { data: studentData, error: queryError } = await supabase
        .from('students')
        .select('id, full_name, school, grade, password_hash')
        .eq('full_name', fullName.trim())
        .eq('school', school.trim())
        .eq('grade', grade.trim())
        .single();

      if (queryError || !studentData) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isPasswordValid = await this.verifyPassword(password, studentData.password_hash);
      
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      return {
        success: true,
        user: {
          id: studentData.id,
          fullName: studentData.full_name,
          school: studentData.school,
          grade: studentData.grade
        }
      };

    } catch (error) {
      console.error('Student authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  // Session validation method
  async validateSession(sessionToken: string): Promise<{ valid: boolean; user?: any }> {
    try {
      // This would typically validate a JWT or session token
      // For now, we'll implement basic validation
      if (!sessionToken || sessionToken.length < 10) {
        return { valid: false };
      }

      // In a real implementation, you would:
      // 1. Decode the session token
      // 2. Verify its signature
      // 3. Check expiration
      // 4. Return user data if valid

      return { valid: true };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Clear rate limiting for testing
  clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(`auth_${identifier}`);
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
