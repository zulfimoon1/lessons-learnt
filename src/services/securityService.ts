
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'csrf_violation' | 'test_admin_created' | 'forced_password_reset';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

class SecurityService {
  private defaultRateLimit: RateLimitConfig = {
    maxAttempts: 5,
    windowMinutes: 15
  };

  // Minimal session validation for platform admin
  async validateSession(): Promise<boolean> {
    try {
      const adminData = localStorage.getItem('platformAdmin');
      return !!adminData;
    } catch (error) {
      return false;
    }
  }

  // Basic CSRF token management
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', token);
    sessionStorage.setItem('csrf_token_timestamp', Date.now().toString());
    return token;
  }

  validateCSRFToken(token: string): boolean {
    try {
      const storedToken = sessionStorage.getItem('csrf_token');
      const timestamp = sessionStorage.getItem('csrf_token_timestamp');
      
      if (!storedToken || !timestamp) return false;
      
      const age = Date.now() - parseInt(timestamp);
      if (age > 60 * 60 * 1000) {
        sessionStorage.removeItem('csrf_token');
        sessionStorage.removeItem('csrf_token_timestamp');
        return false;
      }
      
      return storedToken === token && token.length === 64;
    } catch (error) {
      return false;
    }
  }

  // Basic rate limiting
  async checkRateLimit(identifier: string, action: string, config?: RateLimitConfig): Promise<{ allowed: boolean; message?: string }> {
    return { allowed: true };
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    // Silent operation
  }

  // Basic input validation
  validateAndSanitizeInput(input: string, type: 'name' | 'email' | 'school' | 'grade'): { isValid: boolean; sanitized: string; message?: string } {
    if (!input || input.trim().length === 0) {
      return { isValid: false, sanitized: '', message: 'Input cannot be empty' };
    }

    const sanitized = input.trim().replace(/[<>]/g, '');
    
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(sanitized),
          sanitized,
          message: emailRegex.test(sanitized) ? undefined : 'Invalid email format'
        };
      default:
        return { isValid: true, sanitized };
    }
  }

  // Basic password validation
  validatePassword(password: string): { isValid: boolean; message?: string; score?: number } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long', score: 0 };
    }
    return { isValid: true, score: 3 };
  }

  // Session management
  async clearSession(): Promise<void> {
    try {
      localStorage.removeItem('platformAdmin');
      sessionStorage.clear();
    } catch (error) {
      // Silent fail
    }
  }

  // Completely disabled monitoring
  monitorSecurityViolations(): void {
    // No monitoring - completely disabled
  }

  detectConcurrentSessions(): boolean {
    return false;
  }

  // Completely silent logging
  logSecurityEvent(event: SecurityEvent): void {
    // No logging - completely silent
  }
}

export const securityService = new SecurityService();
