
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

  // Validate password strength according to security standards
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

  // Secure admin authentication - NO hardcoded credentials
  async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Validate password strength for new accounts
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        console.warn('Weak password attempt for admin:', email);
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

      // Successful authentication
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

  // Secure teacher authentication
  async authenticateTeacher(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
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

  // Secure student authentication
  async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    try {
      if (!fullName || !school || !grade || !password) {
        return { success: false, error: 'All fields are required' };
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
}

export const secureAuthenticationService = new SecureAuthenticationService();
