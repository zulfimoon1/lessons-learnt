import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from './enhancedSecurityService';

interface SecureAuthResponse {
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

interface SessionInfo {
  userAgent: string;
  ipAddress: string;
  timestamp: number;
}

class SecureAuthenticationService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

  async secureLogin(email: string, password: string): Promise<SecureAuthResponse> {
    try {
      // Basic email validation
      if (!email || !email.includes('@') || email.length > 254) {
        await this.logSecurityEvent('invalid_input_attempt', 'Invalid email format during login');
        return { error: 'Invalid email format' };
      }

      // Check rate limiting using existing function
      const rateLimitOk = await supabase.rpc('check_rate_limit', {
        operation_type: 'login_attempt',
        max_attempts: this.MAX_LOGIN_ATTEMPTS
      });

      if (!rateLimitOk.data) {
        return { error: 'Too many login attempts. Please try again later.' };
      }

      // Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await this.logSecurityEvent('login_failed', `Login failed for ${email}: ${error.message}`);
        return { error: 'Invalid credentials' };
      }

      if (!data.user) {
        return { error: 'Authentication failed' };
      }

      // Store secure session info
      this.storeSecureSessionInfo();

      await this.logSecurityEvent('login_success', `Successful login for ${email}`);
      return { user: data.user };

    } catch (error) {
      await this.logSecurityEvent('login_error', `Login error: ${error}`);
      return { error: 'Login failed. Please try again.' };
    }
  }

  async secureSignup(email: string, password: string, additionalData?: Record<string, any>): Promise<SecureAuthResponse> {
    try {
      // Basic validation
      if (!email || !email.includes('@') || email.length > 254) {
        return { error: 'Invalid email format' };
      }

      // Validate password strength
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long' };
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { error: 'Password must contain uppercase, lowercase, and numbers' };
      }

      // Check rate limiting for signups
      const rateLimitOk = await supabase.rpc('check_rate_limit', {
        operation_type: 'signup_attempt',
        max_attempts: 3
      });

      if (!rateLimitOk.data) {
        return { error: 'Too many signup attempts. Please try again later.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: additionalData
        }
      });

      if (error) {
        await this.logSecurityEvent('signup_failed', `Signup failed for ${email}: ${error.message}`);
        return { error: error.message };
      }

      await this.logSecurityEvent('signup_success', `Account created for ${email}`);
      
      return { 
        user: data.user,
        requiresVerification: !data.session 
      };

    } catch (error) {
      await this.logSecurityEvent('signup_error', `Signup error: ${error}`);
      return { error: 'Signup failed. Please try again.' };
    }
  }

  async secureSignOut(): Promise<void> {
    try {
      await this.logSecurityEvent('logout_initiated', 'User initiated logout');
      
      // Clear local session data
      this.clearSecureSessionInfo();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      await this.logSecurityEvent('logout_success', 'User logged out successfully');
    } catch (error) {
      await this.logSecurityEvent('logout_error', `Logout error: ${error}`);
      throw error;
    }
  }

  async validateSessionSecurity(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      // Check session timeout
      const sessionInfo = this.getSecureSessionInfo();
      if (sessionInfo && Date.now() - sessionInfo.timestamp > this.SESSION_TIMEOUT) {
        await this.logSecurityEvent('session_expired', 'Session expired due to timeout');
        await this.secureSignOut();
        return false;
      }

      // Basic session validation - we'll log this for monitoring
      await this.logSecurityEvent('session_validated', 'Session validation check performed');
      return true;
    } catch (error) {
      await this.logSecurityEvent('session_validation_error', `Session validation error: ${error}`);
      return false;
    }
  }

  private storeSecureSessionInfo(): void {
    const sessionInfo: SessionInfo = {
      userAgent: navigator.userAgent,
      ipAddress: this.getCurrentIP(),
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('secure_session_info', JSON.stringify(sessionInfo));
  }

  private getSecureSessionInfo(): SessionInfo | null {
    try {
      const stored = sessionStorage.getItem('secure_session_info');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearSecureSessionInfo(): void {
    sessionStorage.removeItem('secure_session_info');
    sessionStorage.removeItem('csrf_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
  }

  private getCurrentIP(): string {
    // This would typically come from a server-side service
    // For now, return a placeholder
    return 'client-side';
  }

  private async logSecurityEvent(eventType: string, details: string): Promise<void> {
    try {
      await enhancedSecurityService.logSecurityEvent({
        type: eventType as any,
        details,
        severity: eventType.includes('failed') || eventType.includes('error') ? 'high' : 'low'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Session monitoring
  startSessionMonitoring(): void {
    // Check session validity every 5 minutes
    setInterval(async () => {
      const isValid = await this.validateSessionSecurity();
      if (!isValid) {
        await this.secureSignOut();
        window.location.href = '/auth';
      }
    }, 5 * 60 * 1000);

    // Monitor for suspicious activity
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await this.validateSessionSecurity();
      }
    });
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
