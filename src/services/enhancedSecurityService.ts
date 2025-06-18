import { supabase } from '@/integrations/supabase/client';
import { inputValidationService } from './inputValidationService';

interface SecurityEvent {
  type: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

class EnhancedSecurityService {
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Use the enhanced security logging function
      await supabase.rpc('log_security_event_enhanced', {
        event_type: event.type,
        user_id: event.userId,
        details: inputValidationService.sanitizeInput(event.details),
        severity: event.severity,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Store locally as fallback
      this.storeSecurityEventLocally(event);
    }
  }

  private storeSecurityEventLocally(event: SecurityEvent): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push({
        ...event,
        timestamp: new Date().toISOString(),
        source: 'local_fallback'
      });
      
      // Keep only last 100 events locally
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to store security event locally:', error);
    }
  }

  async validateLoginAttempt(identifier: string): Promise<boolean> {
    const attempts = this.getLoginAttempts(identifier);
    const now = Date.now();
    
    // Remove old attempts (older than lockout duration)
    const recentAttempts = attempts.filter(
      attempt => now - attempt < this.lockoutDuration
    );
    
    if (recentAttempts.length >= this.maxLoginAttempts) {
      await this.logSecurityEvent({
        type: 'login_rate_limit_exceeded',
        details: `Rate limit exceeded for identifier: ${identifier}`,
        severity: 'high',
        metadata: { identifier, attemptCount: recentAttempts.length }
      });
      return false;
    }
    
    return true;
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    const key = `login_attempts_${identifier}`;
    const attempts = this.getLoginAttempts(identifier);
    attempts.push(Date.now());
    
    // Keep only recent attempts
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt < this.lockoutDuration
    );
    
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    // Log the attempt
    this.logSecurityEvent({
      type: success ? 'login_success' : 'login_failure',
      details: `Login ${success ? 'successful' : 'failed'} for: ${identifier}`,
      severity: success ? 'low' : 'medium',
      metadata: { identifier, success, attemptCount: recentAttempts.length }
    });
  }

  private getLoginAttempts(identifier: string): number[] {
    try {
      const key = `login_attempts_${identifier}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  validateInputSecurity(input: string, type: 'email' | 'password' | 'name' | 'text'): boolean {
    switch (type) {
      case 'email':
        return inputValidationService.validateEmail(input);
      case 'password':
        return inputValidationService.validatePassword(input).isValid;
      case 'name':
        return inputValidationService.validatePersonName(input);
      case 'text':
        return inputValidationService.validateTextContent(input);
      default:
        return false;
    }
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken || token.length !== expectedToken.length) {
      return false;
    }
    
    // Timing-safe comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    
    return result === 0;
  }

  async checkSessionSecurity(): Promise<boolean> {
    try {
      // Verify current session is still valid
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await this.logSecurityEvent({
          type: 'invalid_session_detected',
          details: 'Session validation failed',
          severity: 'medium'
        });
        return false;
      }
      
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await this.logSecurityEvent({
          type: 'expired_session_detected',
          details: 'Expired session detected',
          severity: 'medium'
        });
        return false;
      }
      
      return true;
    } catch (error) {
      await this.logSecurityEvent({
        type: 'session_check_error',
        details: `Session security check failed: ${error}`,
        severity: 'high'
      });
      return false;
    }
  }

  sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = inputValidationService.sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
