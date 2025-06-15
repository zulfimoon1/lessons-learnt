import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface SecurityEvent {
  type: 'unauthorized_access' | 'suspicious_activity' | 'authentication_failure' | 'rate_limit_exceeded';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

interface ValidationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  requireAlphanumeric?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

class EnhancedSecurityValidationService {
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private csrfTokens = new Set<string>();

  // Enhanced input validation with XSS and injection protection
  validateInput(input: string, fieldName: string, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Length validation
    if (options.maxLength && input.length > options.maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${options.maxLength} characters`);
    }

    // XSS detection
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        errors.push('Potentially malicious content detected');
        riskLevel = 'high';
        break;
      }
    }

    // SQL injection detection
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\b.*=)/gi,
      /(--|\/\*|\*\/)/gi,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        errors.push('Potential SQL injection detected');
        riskLevel = 'high';
        break;
      }
    }

    // HTML validation
    if (!options.allowHtml && /<[^>]*>/g.test(input)) {
      errors.push('HTML tags are not allowed');
      riskLevel = 'medium';
    }

    // Alphanumeric requirement
    if (options.requireAlphanumeric && !/^[a-zA-Z0-9\s\-_\.]+$/.test(input)) {
      errors.push('Only alphanumeric characters, spaces, hyphens, underscores, and periods are allowed');
      riskLevel = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel
    };
  }

  // Enhanced rate limiting with exponential backoff
  checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const stored = this.rateLimitStore.get(key);

    if (!stored || now > stored.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (stored.count >= maxAttempts) {
      // Exponential backoff
      const backoffMultiplier = Math.min(Math.pow(2, stored.count - maxAttempts), 32);
      stored.resetTime = now + (windowMs * backoffMultiplier);
      return false;
    }

    stored.count++;
    return true;
  }

  // Enhanced session security validation
  validateSessionSecurity(): boolean {
    try {
      // Check for session hijacking indicators
      const userAgent = navigator.userAgent;
      const storedUserAgent = sessionStorage.getItem('sec_ua');
      
      if (storedUserAgent && storedUserAgent !== userAgent) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          details: 'User agent mismatch detected - possible session hijacking',
          severity: 'high'
        });
        return false;
      }

      if (!storedUserAgent) {
        sessionStorage.setItem('sec_ua', userAgent);
      }

      // Check for suspicious timing patterns
      const lastActivity = sessionStorage.getItem('last_activity');
      const now = Date.now();
      
      if (lastActivity) {
        const timeDiff = now - parseInt(lastActivity);
        if (timeDiff < 100) { // Suspiciously fast activity
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: 'Suspiciously fast user activity detected',
            severity: 'medium'
          });
        }
      }
      
      sessionStorage.setItem('last_activity', now.toString());

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Enhanced CSRF token generation and validation
  generateCSRFToken(): string {
    const token = crypto.randomUUID() + '-' + Date.now();
    this.csrfTokens.add(token);
    
    // Clean up old tokens (keep last 10)
    if (this.csrfTokens.size > 10) {
      const tokensArray = Array.from(this.csrfTokens);
      this.csrfTokens.clear();
      tokensArray.slice(-10).forEach(t => this.csrfTokens.add(t));
    }
    
    return token;
  }

  validateCSRFToken(token: string): boolean {
    return this.csrfTokens.has(token);
  }

  // Enhanced password validation
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common weak patterns');
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel: errors.length > 2 ? 'high' : errors.length > 0 ? 'medium' : 'low'
    };
  }

  // Secure password hashing
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Increased for better security
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Enhanced security event logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: event.type,
        user_id: event.userId,
        details: event.details,
        severity: event.severity
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Store locally as fallback
      const localEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      localEvents.push({
        ...event,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('security_events', JSON.stringify(localEvents.slice(-100)));
    }
  }

  // Email validation with enhanced security
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    // Basic email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Email contains suspicious patterns');
    }

    // Length validation
    if (email.length > 254) {
      errors.push('Email address too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel: errors.length > 0 ? 'medium' : 'low'
    };
  }

  // Sanitize input for safe database storage
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .trim();
  }

  // Check for suspicious activity patterns
  detectSuspiciousActivity(): boolean {
    const recentEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    const recentHighSeverity = recentEvents.filter((event: any) => 
      event.severity === 'high' && 
      new Date(event.timestamp) > new Date(Date.now() - 300000) // Last 5 minutes
    );

    if (recentHighSeverity.length > 3) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        details: 'Multiple high-severity security events detected',
        severity: 'high'
      });
      return true;
    }

    return false;
  }
}

export const enhancedSecurityValidationService = new EnhancedSecurityValidationService();
