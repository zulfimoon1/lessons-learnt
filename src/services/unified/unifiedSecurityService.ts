
import { securityValidationService } from '../securityValidationService';
import { enhancedSecureSessionService } from '../enhancedSecureSessionService';

interface SecurityEvent {
  type: 'unauthorized_access' | 'suspicious_activity' | 'form_validation_failed' | 'rate_limit_exceeded';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  recentViolations: number;
  blockedIPs: string[];
}

class UnifiedSecurityService {
  // Centralized security event logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      securityValidationService.logSecurityEvent(event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Input validation and sanitization
  validateAndSanitizeInput(input: string, fieldType: string): string {
    // Basic sanitization
    let sanitized = input.trim();
    
    switch (fieldType) {
      case 'email':
        sanitized = sanitized.toLowerCase();
        break;
      case 'name':
        sanitized = sanitized.replace(/[<>\"']/g, '');
        break;
      case 'text':
        sanitized = sanitized.replace(/[<>]/g, '');
        break;
    }

    return sanitized;
  }

  // Rate limiting check
  async checkRateLimit(identifier: string, action: string): Promise<boolean> {
    const key = `rate_limit_${identifier}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;

    try {
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };

      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count++;
      }

      localStorage.setItem(key, JSON.stringify(data));

      if (data.count > maxRequests) {
        await this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          userId: identifier,
          details: `Rate limit exceeded for ${action}`,
          severity: 'medium'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  }

  // Session security
  async createSecureSession(userId: string, userType: 'teacher' | 'student' | 'admin', school: string) {
    return enhancedSecureSessionService.createSession(userId, userType, school);
  }

  async validateSession() {
    return enhancedSecureSessionService.getSession();
  }

  async clearSession() {
    enhancedSecureSessionService.clearSession();
  }

  // Security metrics
  getSecurityMetrics(): SecurityMetrics {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      const now = Date.now();
      const dayAgo = now - (24 * 60 * 60 * 1000);

      return {
        totalEvents: events.length,
        criticalEvents: events.filter((e: any) => e.severity === 'high').length,
        recentViolations: events.filter((e: any) => e.timestamp > dayAgo).length,
        blockedIPs: [] // Placeholder
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        recentViolations: 0,
        blockedIPs: []
      };
    }
  }

  // Cleanup old events
  cleanup(): void {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      const now = Date.now();
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      const recentEvents = events.filter((e: any) => e.timestamp > weekAgo);
      localStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to cleanup security events:', error);
    }
  }
}

export const unifiedSecurityService = new UnifiedSecurityService();

// Cleanup every hour
setInterval(() => {
  unifiedSecurityService.cleanup();
}, 60 * 60 * 1000);
