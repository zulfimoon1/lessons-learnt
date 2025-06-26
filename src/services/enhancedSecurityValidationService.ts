
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'session_error';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

class EnhancedSecurityValidationService {
  private rateLimitStore = new Map<string, { count: number; timestamp: number }>();
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ATTEMPTS = 5;

  validateInput(input: string, type: 'email' | 'name' | 'school' | 'grade' | 'text', options?: { maxLength?: number; requireAlphanumeric?: boolean }): ValidationResult {
    const errors: string[] = [];
    const maxLength = options?.maxLength || 255;

    if (!input || input.trim().length === 0) {
      return { isValid: false, errors: ['Input cannot be empty'], riskLevel: 'medium' };
    }

    if (input.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`);
    }

    // Enhanced XSS pattern detection
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript\s*:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /<iframe[\s\S]*?>/gi,
      /<object[\s\S]*?>/gi,
      /<embed[\s\S]*?>/gi,
      /expression\s*\(/gi,
      /vbscript\s*:/gi,
      /data\s*:\s*text\/html/gi
    ];
    
    if (xssPatterns.some(pattern => pattern.test(input))) {
      errors.push('Potentially malicious content detected');
      return { isValid: false, errors, riskLevel: 'high' };
    }

    // SQL injection pattern detection
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(input))) {
      errors.push('Potentially malicious SQL patterns detected');
      return { isValid: false, errors, riskLevel: 'high' };
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          errors.push('Invalid email format');
        }
        break;
      case 'name':
      case 'school':
        if (options?.requireAlphanumeric && !/^[a-zA-Z0-9\s\-_.]+$/.test(input)) {
          errors.push('Only alphanumeric characters, spaces, hyphens, and periods are allowed');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel: errors.length > 0 ? 'medium' : 'low'
    };
  }

  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    // Increased minimum length for better security
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Enhanced weak password detection
    const weakPatterns = [
      /password/gi,
      /123456/g,
      /admin/gi,
      /qwerty/gi,
      /letmein/gi,
      /welcome/gi,
      /monkey/gi,
      /dragon/gi
    ];
    
    if (weakPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common weak patterns');
      return { isValid: false, errors, riskLevel: 'high' };
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel: errors.length > 0 ? 'medium' : 'low'
    };
  }

  checkRateLimit(identifier: string, maxAttempts?: number, windowMs?: number): boolean {
    const now = Date.now();
    const attempts = maxAttempts || this.MAX_ATTEMPTS;
    const window = windowMs || this.RATE_LIMIT_WINDOW;
    const record = this.rateLimitStore.get(identifier);

    if (!record) {
      this.rateLimitStore.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.timestamp > window) {
      this.rateLimitStore.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= attempts) {
      return false;
    }

    // Increment count
    record.count++;
    return true;
  }

  validateSessionSecurity(): boolean {
    try {
      // Enhanced session validation checks
      const hasValidStorage = typeof Storage !== 'undefined';
      const hasSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
      
      // Check for common security headers (if available)
      const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
      
      return hasValidStorage && hasSecureContext;
    } catch (error) {
      return false;
    }
  }

  detectSuspiciousActivity(): boolean {
    try {
      // Check for rapid successive requests
      const now = Date.now();
      const lastActivity = parseInt(sessionStorage.getItem('last_activity') || '0');
      
      if (lastActivity && (now - lastActivity) < 100) {
        return true; // Suspicious rapid activity
      }
      
      sessionStorage.setItem('last_activity', now.toString());
      return false;
    } catch (error) {
      return false;
    }
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    try {
      sessionStorage.setItem('csrf_token', token);
      sessionStorage.setItem('csrf_token_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
    
    return token;
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to audit table for compliance
      await supabase.from('audit_log').insert({
        table_name: 'security_events',
        operation: event.type,
        user_id: event.userId || null,
        new_data: {
          details: event.details,
          severity: event.severity,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      // Silent fail - don't block operations
      console.warn('Failed to log security event:', error);
    }
  }

  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Clear rate limiting for testing purposes
  clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier);
  }

  // Get security statistics
  getSecurityStats(): {
    totalRateLimitEntries: number;
    activeRateLimits: number;
  } {
    const now = Date.now();
    const activeCount = Array.from(this.rateLimitStore.values())
      .filter(record => (now - record.timestamp) <= this.RATE_LIMIT_WINDOW).length;

    return {
      totalRateLimitEntries: this.rateLimitStore.size,
      activeRateLimits: activeCount
    };
  }
}

export const enhancedSecurityValidationService = new EnhancedSecurityValidationService();
