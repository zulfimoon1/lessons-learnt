
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityEvent {
  type: 'unauthorized_access' | 'suspicious_activity' | 'form_validation_failed' | 'rate_limit_exceeded';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

class EnhancedSecurityValidationService {
  private rateLimitStore = new Map<string, { count: number; lastReset: number }>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 60000; // 1 minute

  // Enhanced input validation with XSS and injection protection
  validateInput(input: string, fieldName: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    requireAlphanumeric?: boolean;
  } = {}): ValidationResult {
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Basic sanitization
    const trimmedInput = input.trim();

    // Length validation
    if (options.maxLength && trimmedInput.length > options.maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${options.maxLength}`);
    }

    // XSS protection - detect potential script injection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(trimmedInput)) {
        errors.push(`${fieldName} contains potentially dangerous content`);
        riskLevel = 'high';
        break;
      }
    }

    // SQL injection protection
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)|(\b(or|and)\b\s*\d+\s*=\s*\d+)|(';\s*(drop|delete|insert|update))/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into)\b)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(trimmedInput)) {
        errors.push(`${fieldName} contains potentially malicious SQL patterns`);
        riskLevel = 'high';
        break;
      }
    }

    // Alphanumeric requirement
    if (options.requireAlphanumeric && !/^[a-zA-Z0-9\s\-_.,()]+$/.test(trimmedInput)) {
      errors.push(`${fieldName} contains invalid characters`);
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    // HTML content check
    if (!options.allowHtml && /<[^>]+>/.test(trimmedInput)) {
      errors.push(`${fieldName} cannot contain HTML tags`);
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel
    };
  }

  // Enhanced rate limiting with user tracking
  checkRateLimit(identifier: string, maxAttempts: number = this.maxAttempts, windowMs: number = this.windowMs): boolean {
    const now = Date.now();
    const stored = this.rateLimitStore.get(identifier);

    if (!stored || now - stored.lastReset > windowMs) {
      this.rateLimitStore.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    if (stored.count >= maxAttempts) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for identifier: ${identifier}`,
        severity: 'medium'
      });
      return false;
    }

    stored.count++;
    return true;
  }

  // Session security validation
  validateSessionSecurity(): boolean {
    try {
      // Check for session tampering indicators
      const userAgent = navigator.userAgent;
      const sessionData = sessionStorage.getItem('security_fingerprint');
      
      if (!sessionData) {
        // Generate new fingerprint
        const fingerprint = this.generateSessionFingerprint();
        sessionStorage.setItem('security_fingerprint', fingerprint);
        return true;
      }

      // Validate existing fingerprint
      const currentFingerprint = this.generateSessionFingerprint();
      if (sessionData !== currentFingerprint) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          details: 'Session fingerprint mismatch detected',
          severity: 'high'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Log security events to database
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
      // Fallback to local logging
      console.warn('Security Event:', event);
    }
  }

  // Private helper methods
  private generateSessionFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString()
    ];
    
    return btoa(components.join('|')).slice(0, 32);
  }

  // Clean up expired rate limit entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now - value.lastReset > this.windowMs * 2) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

export const enhancedSecurityValidationService = new EnhancedSecurityValidationService();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  enhancedSecurityValidationService.cleanup();
}, 5 * 60 * 1000);
