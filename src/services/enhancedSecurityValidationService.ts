
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'authentication_failure' | 'session_restored' | 'session_error' | 'storage_error' | 'csrf_violation' | 'test_admin_created' | 'forced_password_reset';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

class EnhancedSecurityValidationService {
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  private suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /(union|select|insert|update|delete|drop|create|alter)\s+/gi,
    /(\||&|;|\$\(|\`)/g
  ];

  validateInput(
    value: string, 
    type: 'email' | 'password' | 'name' | 'school' | 'grade' | 'text' = 'text',
    options: { maxLength?: number; allowHtml?: boolean; requireAlphanumeric?: boolean } = {}
  ): ValidationResult {
    const { maxLength = 255, allowHtml = false, requireAlphanumeric = false } = options;
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Length validation
    if (value.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`);
      riskLevel = 'medium';
    }

    // XSS and injection detection
    if (!allowHtml) {
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(value)) {
          errors.push('Potentially malicious content detected');
          riskLevel = 'high';
          break;
        }
      }
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Invalid email format');
          riskLevel = 'medium';
        }
        break;
      
      case 'password':
        if (value.length < 8) {
          errors.push('Password must be at least 8 characters');
          riskLevel = 'medium';
        }
        break;
      
      case 'name':
      case 'school':
        if (requireAlphanumeric && !/^[a-zA-Z0-9\s\-'\.]+$/.test(value)) {
          errors.push('Contains invalid characters');
          riskLevel = 'medium';
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel
    };
  }

  validateEmail(email: string): ValidationResult {
    return this.validateInput(email, 'email');
  }

  validatePassword(password: string): ValidationResult {
    const result = this.validateInput(password, 'password');
    
    // Additional password strength checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthScore < 2) {
      result.errors.push('Password should contain uppercase, lowercase, numbers, and special characters');
      result.riskLevel = 'medium';
      result.isValid = false;
    }

    return result;
  }

  async hashPassword(password: string): Promise<string> {
    // Use Web Crypto API for secure hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.generateSalt());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Simple comparison for demo - in production use bcrypt
    const newHash = await this.hashPassword(password);
    return newHash === hash;
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now - entry.lastReset > windowMs) {
      this.rateLimitMap.set(key, { count: 1, lastReset: now });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  validateSessionSecurity(): boolean {
    try {
      // Check for basic browser security features
      const hasSecureContext = window.isSecureContext;
      const hasSessionStorage = typeof sessionStorage !== 'undefined';
      
      return hasSecureContext && hasSessionStorage;
    } catch (error) {
      console.error('Session security validation failed:', error);
      return false;
    }
  }

  detectSuspiciousActivity(): boolean {
    // Basic suspicious activity detection
    const userAgent = navigator.userAgent;
    const suspiciousUserAgents = ['bot', 'crawler', 'spider'];
    
    return suspiciousUserAgents.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    );
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: event.type,
        user_id: event.userId || null,
        details: event.details,
        severity: event.severity
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const enhancedSecurityValidationService = new EnhancedSecurityValidationService();
