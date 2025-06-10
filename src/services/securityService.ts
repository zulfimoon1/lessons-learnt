import { supabase } from '@/integrations/supabase/client';
import { enhancedValidateInput } from './enhancedInputValidation';
import { hashPassword, verifyPassword } from './securePasswordService';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'csrf_violation';
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

  // Enhanced session validation
  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        this.logSecurityEvent({
          type: 'session_error',
          timestamp: new Date().toISOString(),
          details: 'Session validation failed',
          userAgent: navigator.userAgent
        });
        return false;
      }

      // Check session age (max 24 hours)
      const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Enhanced CSRF token management
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
      
      // Check if token expired (1 hour)
      const age = Date.now() - parseInt(timestamp);
      if (age > 60 * 60 * 1000) {
        sessionStorage.removeItem('csrf_token');
        sessionStorage.removeItem('csrf_token_timestamp');
        return false;
      }
      
      return storedToken === token && token.length === 64;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  // Enhanced rate limiting
  async checkRateLimit(identifier: string, action: string, config?: RateLimitConfig): Promise<{ allowed: boolean; message?: string }> {
    const rateLimitConfig = config || this.defaultRateLimit;
    const key = `rate_limit_${action}_${identifier}`;
    const now = Date.now();
    const windowMs = rateLimitConfig.windowMinutes * 60 * 1000;
    
    try {
      const attempts = JSON.parse(localStorage.getItem(key) || '[]');
      const validAttempts = attempts.filter((time: number) => now - time < windowMs);
      
      if (validAttempts.length >= rateLimitConfig.maxAttempts) {
        this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: `Rate limit exceeded for ${action}`,
          userAgent: navigator.userAgent
        });
        
        return {
          allowed: false,
          message: `Too many attempts. Please wait ${rateLimitConfig.windowMinutes} minutes before trying again.`
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open for availability
    }
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    const key = `rate_limit_${action}_${identifier}`;
    const now = Date.now();
    
    try {
      const attempts = JSON.parse(localStorage.getItem(key) || '[]');
      if (!success) {
        attempts.push(now);
        // Keep only last 50 attempts to prevent storage bloat
        const recentAttempts = attempts.slice(-50);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
      } else {
        // Clear attempts on successful login
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to record attempt:', error);
    }
  }

  // Enhanced input validation with threat detection
  validateAndSanitizeInput(input: string, type: 'name' | 'email' | 'school' | 'grade'): { isValid: boolean; sanitized: string; message?: string } {
    let validation;
    
    switch (type) {
      case 'name':
        validation = enhancedValidateInput.validateName(input);
        break;
      case 'email':
        validation = enhancedValidateInput.validateEmail(input);
        break;
      case 'school':
        validation = enhancedValidateInput.validateSchool(input);
        break;
      case 'grade':
        validation = enhancedValidateInput.validateGrade(input);
        break;
      default:
        return { isValid: false, sanitized: '', message: 'Invalid input type' };
    }
    
    if (!validation.isValid) {
      return { isValid: false, sanitized: '', message: validation.message };
    }
    
    // Check for advanced threats
    const threatCheck = enhancedValidateInput.detectAdvancedThreats(input);
    if (threatCheck.isSuspicious) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Suspicious input detected: ${threatCheck.reason}`,
        userAgent: navigator.userAgent
      });
      return { isValid: false, sanitized: '', message: 'Input contains suspicious patterns' };
    }
    
    const sanitized = enhancedValidateInput.sanitizeText(input);
    return { isValid: true, sanitized };
  }

  // Enhanced password validation
  validatePassword(password: string): { isValid: boolean; message?: string; score?: number } {
    return enhancedValidateInput.validatePasswordComplexity(password);
  }

  // Secure session management
  async clearSession(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      
      this.logSecurityEvent({
        type: 'logout',
        timestamp: new Date().toISOString(),
        details: 'Session cleared securely',
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Session clear error:', error);
    }
  }

  // Security event logging
  logSecurityEvent(event: SecurityEvent): void {
    console.log('Security Event:', event);
    
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push({
        ...event,
        sessionId: sessionStorage.getItem('session_id'),
        fingerprint: this.generateBrowserFingerprint()
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  // Browser fingerprinting for additional security
  private generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth,
      canvas: canvas.toDataURL()
    };
    
    return btoa(JSON.stringify(fingerprint)).substring(0, 32);
  }

  // Detect concurrent sessions
  detectConcurrentSessions(): boolean {
    const sessionId = sessionStorage.getItem('session_id');
    const storedSessionId = localStorage.getItem('last_session_id');
    
    if (storedSessionId && sessionId && storedSessionId !== sessionId) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: 'Concurrent session detected',
        userAgent: navigator.userAgent
      });
      return true;
    }
    
    if (sessionId) {
      localStorage.setItem('last_session_id', sessionId);
    }
    
    return false;
  }

  // Monitor for security violations
  monitorSecurityViolations(): void {
    // Monitor for storage tampering
    window.addEventListener('storage', (e) => {
      if (e.key?.includes('user') || e.key?.includes('session')) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: 'Storage tampering detected',
          userAgent: navigator.userAgent
        });
      }
    });

    // Monitor for developer tools
    let devtools = false;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
        if (!devtools) {
          devtools = true;
          this.logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: new Date().toISOString(),
            details: 'Developer tools opened',
            userAgent: navigator.userAgent
          });
        }
      } else {
        devtools = false;
      }
    }, 1000);
  }
}

export const securityService = new SecurityService();
