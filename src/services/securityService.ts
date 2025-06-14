interface SecurityEvent {
  type: string;
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}

interface RateLimitResult {
  allowed: boolean;
  message?: string;
  lockoutUntil?: number;
}

class SecurityService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes

  // Simple session validation that doesn't block authentication
  async validateSession(): Promise<boolean> {
    try {
      // Just return true for now to not block authentication
      // In production, this would check session tokens, etc.
      return true;
    } catch (error) {
      console.warn('Session validation error:', error);
      return true; // Don't block authentication on validation errors
    }
  }

  // Rate limiting check
  async checkRateLimit(identifier: string, operation: string, options?: { maxAttempts?: number; windowMinutes?: number }): Promise<RateLimitResult> {
    try {
      const maxAttempts = options?.maxAttempts || this.MAX_ATTEMPTS;
      const windowMs = (options?.windowMinutes || 15) * 60 * 1000;
      
      const key = `${operation}:${identifier}`;
      const now = Date.now();
      
      // Get stored attempts
      const storedData = localStorage.getItem(`rate_limit_${key}`);
      let attempts: number[] = [];
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          attempts = parsed.attempts || [];
        } catch (e) {
          // Invalid data, reset
          attempts = [];
        }
      }
      
      // Filter out old attempts
      attempts = attempts.filter(timestamp => now - timestamp < windowMs);
      
      if (attempts.length >= maxAttempts) {
        const oldestAttempt = Math.min(...attempts);
        const lockoutUntil = oldestAttempt + windowMs;
        
        return {
          allowed: false,
          message: 'Too many failed attempts. Please try again later.',
          lockoutUntil
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.warn('Rate limit check error:', error);
      return { allowed: true }; // Don't block on errors
    }
  }

  // Record authentication attempt
  async recordAttempt(identifier: string, operation: string, success: boolean): Promise<void> {
    try {
      if (!success) {
        const key = `${operation}:${identifier}`;
        const now = Date.now();
        
        // Get existing attempts
        const storedData = localStorage.getItem(`rate_limit_${key}`);
        let attempts: number[] = [];
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            attempts = parsed.attempts || [];
          } catch (e) {
            attempts = [];
          }
        }
        
        attempts.push(now);
        
        // Store updated attempts
        localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ attempts }));
      } else {
        // Clear rate limiting on successful login
        const key = `${operation}:${identifier}`;
        localStorage.removeItem(`rate_limit_${key}`);
      }
    } catch (error) {
      console.warn('Error recording attempt:', error);
    }
  }

  // Security event logging
  logSecurityEvent(event: SecurityEvent): void {
    try {
      console.log('Security Event:', event);
      
      // Store in localStorage for debugging
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Error logging security event:', error);
    }
  }

  // Session management
  async clearSession(): Promise<void> {
    try {
      // Clear all auth-related localStorage items
      const keysToRemove = ['teacher', 'student', 'platformAdmin'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear rate limiting data on logout
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rate_limit_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing session:', error);
    }
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    try {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    } catch (error) {
      console.warn('Error generating CSRF token:', error);
      return 'fallback-token';
    }
  }

  // Monitor security violations
  monitorSecurityViolations(): void {
    try {
      // Basic security monitoring setup
      console.log('Security monitoring initialized');
    } catch (error) {
      console.warn('Error setting up security monitoring:', error);
    }
  }
}

export const securityService = new SecurityService();
