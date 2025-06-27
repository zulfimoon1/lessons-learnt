
import { supabase } from '@/integrations/supabase/client';
import { securityValidationService } from '../securityValidationService';

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresMFA?: boolean;
}

class UnifiedAuthService {
  // Consolidated authentication for all user types
  async authenticateUser(
    userType: 'student' | 'teacher' | 'admin' | 'platform_admin',
    credentials: AuthCredentials,
    context?: {
      userAgent?: string;
      ipAddress?: string;
    }
  ): Promise<AuthResult> {
    try {
      // Input validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Security validation
      const isValid = await securityValidationService.validateCredentials(credentials);
      if (!isValid) {
        throw new Error('Invalid credentials format');
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        // Log security event
        securityValidationService.logSecurityEvent({
          type: 'unauthorized_access',
          userId: credentials.email,
          details: `Failed login attempt for ${userType}`,
          severity: 'medium'
        });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Verify user type matches
      const userMetadata = data.user.user_metadata;
      if (userMetadata?.user_type !== userType) {
        return { success: false, error: 'Invalid user type' };
      }

      // Log successful authentication
      securityValidationService.logSecurityEvent({
        type: 'unauthorized_access', // Using available type
        userId: data.user.id,
        details: `Successful ${userType} login`,
        severity: 'low'
      });

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      };
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      };
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session?.user;
  }
}

export const unifiedAuthService = new UnifiedAuthService();
