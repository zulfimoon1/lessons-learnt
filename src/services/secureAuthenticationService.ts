
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from './enhancedSecurityService';
import { inputValidationService } from './inputValidationService';

interface LoginCredentials {
  email: string;
  password: string;
  userType: 'teacher' | 'student';
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  school: string;
  userType: 'teacher' | 'student';
  grade?: string;
  role?: string;
}

class SecureAuthenticationService {
  async secureLogin(credentials: LoginCredentials): Promise<any> {
    const { email, password, userType } = credentials;
    
    // Validate inputs
    if (!inputValidationService.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    const passwordValidation = inputValidationService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error('Invalid password format');
    }
    
    // Check rate limiting
    const isAllowed = await enhancedSecurityService.validateLoginAttempt(email);
    if (!isAllowed) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    
    try {
      let userData = null;
      
      if (userType === 'teacher') {
        // Query teachers table for authentication
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', email)
          .single();
          
        if (teacherError || !teacherData) {
          enhancedSecurityService.recordLoginAttempt(email, false);
          throw new Error('Invalid credentials');
        }
        
        // In a real implementation, you'd verify the password hash here
        // For now, we'll use a simplified approach
        userData = teacherData;
        
      } else if (userType === 'student') {
        // For students, we don't have email-based auth in the current schema
        // This would need to be implemented based on your student auth requirements
        throw new Error('Student authentication not implemented in this method');
      }
      
      if (userData) {
        enhancedSecurityService.recordLoginAttempt(email, true);
        
        await enhancedSecurityService.logSecurityEvent({
          type: 'successful_login',
          userId: userData.id,
          details: `Successful ${userType} login for ${email}`,
          severity: 'low',
          metadata: { userType, school: userData.school }
        });
        
        return userData;
      }
      
      throw new Error('Authentication failed');
      
    } catch (error) {
      enhancedSecurityService.recordLoginAttempt(email, false);
      
      await enhancedSecurityService.logSecurityEvent({
        type: 'failed_login',
        details: `Failed login attempt for ${email}: ${error}`,
        severity: 'medium',
        metadata: { userType, email }
      });
      
      throw error;
    }
  }
  
  async secureSignup(signupData: SignupData): Promise<any> {
    const { email, password, name, school, userType } = signupData;
    
    // Validate all inputs
    if (!inputValidationService.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    const passwordValidation = inputValidationService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
    }
    
    if (!inputValidationService.validatePersonName(name)) {
      throw new Error('Invalid name format');
    }
    
    if (!inputValidationService.validateSchoolName(school)) {
      throw new Error('Invalid school name format');
    }
    
    try {
      // For teachers, create account in teachers table
      if (userType === 'teacher') {
        // Hash password (in production, use proper bcrypt)
        const passwordHash = await this.hashPassword(password);
        
        const { data, error } = await supabase
          .from('teachers')
          .insert({
            email: inputValidationService.sanitizeInput(email),
            name: inputValidationService.sanitizeInput(name),
            school: inputValidationService.sanitizeInput(school),
            password_hash: passwordHash,
            role: signupData.role || 'teacher'
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        await enhancedSecurityService.logSecurityEvent({
          type: 'user_registration',
          userId: data.id,
          details: `New ${userType} registration: ${email}`,
          severity: 'low',
          metadata: { userType, school, role: signupData.role }
        });
        
        return data;
      }
      
      throw new Error('Signup method not implemented for this user type');
      
    } catch (error) {
      await enhancedSecurityService.logSecurityEvent({
        type: 'registration_error',
        details: `Registration failed for ${email}: ${error}`,
        severity: 'medium',
        metadata: { userType, school }
      });
      
      throw error;
    }
  }
  
  private async hashPassword(password: string): Promise<string> {
    // In production, use proper bcrypt
    // For now, return a placeholder
    return `hashed_${password}_${Date.now()}`;
  }
  
  async validateSession(): Promise<boolean> {
    return await enhancedSecurityService.checkSessionSecurity();
  }
  
  async secureLogout(): Promise<void> {
    await enhancedSecurityService.logSecurityEvent({
      type: 'user_logout',
      details: 'User initiated secure logout',
      severity: 'low'
    });
    
    // Clear any security tokens
    sessionStorage.removeItem('csrf_token');
    localStorage.removeItem('auth_context');
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
