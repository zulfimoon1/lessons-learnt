
import { supabase } from '@/integrations/supabase/client';

interface SecureAuthResponse {
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

interface SessionInfo {
  userAgent: string;
  timestamp: number;
}

class SecureAuthenticationService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

  async secureLogin(email: string, password: string): Promise<SecureAuthResponse> {
    try {
      // Basic email validation
      if (!email || !email.includes('@') || email.length > 254) {
        return { error: 'Invalid email format' };
      }

      // Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error.message);
        return { error: 'Invalid credentials' };
      }

      if (!data.user) {
        return { error: 'Authentication failed' };
      }

      // Store simple session info
      this.storeSessionInfo();

      return { user: data.user };

    } catch (error) {
      console.error('Login error:', error);
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: additionalData
        }
      });

      if (error) {
        console.error('Signup failed:', error.message);
        return { error: error.message };
      }

      return { 
        user: data.user,
        requiresVerification: !data.session 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  }

  async secureSignOut(): Promise<void> {
    try {
      this.clearSessionInfo();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
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
      const sessionInfo = this.getSessionInfo();
      if (sessionInfo && Date.now() - sessionInfo.timestamp > this.SESSION_TIMEOUT) {
        await this.secureSignOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  private storeSessionInfo(): void {
    const sessionInfo: SessionInfo = {
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('session_info', JSON.stringify(sessionInfo));
  }

  private getSessionInfo(): SessionInfo | null {
    try {
      const stored = sessionStorage.getItem('session_info');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearSessionInfo(): void {
    sessionStorage.removeItem('session_info');
    sessionStorage.removeItem('csrf_token');
  }

  // Simplified session monitoring
  startSessionMonitoring(): void {
    // Check session validity every 5 minutes
    setInterval(async () => {
      const isValid = await this.validateSessionSecurity();
      if (!isValid) {
        await this.secureSignOut();
        window.location.href = '/auth';
      }
    }, 5 * 60 * 1000);
  }
}

export const secureAuthenticationService = new SecureAuthenticationService();
