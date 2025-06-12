
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

  // Simplified session validation for platform admin
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
    const rateLimitConfig = config || this.defaultRateLimit;
    const key = `rate_limit_${action}_${identifier}`;
    const now = Date.now();
    const windowMs = rateLimitConfig.windowMinutes * 60 * 1000;
    
    try {
      const attempts = JSON.parse(localStorage.getItem(key) || '[]');
      const validAttempts = attempts.filter((time: number) => now - time < windowMs);
      
      if (validAttempts.length >= rateLimitConfig.maxAttempts) {
        return {
          allowed: false,
          message: `Too many attempts. Please wait ${rateLimitConfig.windowMinutes} minutes before trying again.`
        };
      }
      
      return { allowed: true };
    } catch (error) {
      return { allowed: true };
    }
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    const key = `rate_limit_${action}_${identifier}`;
    const now = Date.now();
    
    try {
      const attempts = JSON.parse(localStorage.getItem(key) || '[]');
      if (!success) {
        attempts.push(now);
        const recentAttempts = attempts.slice(-50);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      // Silent fail
    }
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

  // Minimal logging
  logSecurityEvent(event: SecurityEvent): void {
    // Only log critical events
    if (event.type === 'login_failed' || event.type === 'rate_limit_exceeded') {
      console.log('Security Event:', event.type);
    }
  }
}

export const securityService = new SecurityService();
