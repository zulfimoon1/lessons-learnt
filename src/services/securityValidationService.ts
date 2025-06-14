
// Enhanced security validation service
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export interface SecurityConfig {
  maxLength: number;
  minLength?: number;
  allowSpecialChars?: boolean;
  allowHtml?: boolean;
}

class SecurityValidationService {
  private readonly dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /import\s*\(/gi,
    /eval\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi
  ];

  private readonly sqlInjectionPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UPDATE|UNION)\b)/gi,
    /(INFORMATION_SCHEMA|sysobjects|syscolumns)/gi,
    /(1=1|1 = 1)/gi,
    /('|\"|;|--|\|\|)/g
  ];

  validateInput(input: string, type: string, config?: SecurityConfig): ValidationResult {
    const errors: string[] = [];
    
    if (!input || typeof input !== 'string') {
      return { isValid: false, errors: ['Input is required and must be a string'] };
    }

    const trimmedInput = input.trim();
    
    // Length validation
    const maxLength = config?.maxLength || 1000;
    const minLength = config?.minLength || 0;
    
    if (trimmedInput.length > maxLength) {
      errors.push(`Input too long (max ${maxLength} characters)`);
    }
    
    if (trimmedInput.length < minLength) {
      errors.push(`Input too short (min ${minLength} characters)`);
    }

    // XSS validation
    if (!config?.allowHtml) {
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(trimmedInput)) {
          errors.push('Input contains potentially dangerous content');
          break;
        }
      }
    }

    // SQL injection validation
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(trimmedInput)) {
        errors.push('Input contains potentially malicious SQL patterns');
        break;
      }
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        if (!this.validateEmail(trimmedInput)) {
          errors.push('Invalid email format');
        }
        break;
      case 'name':
        if (!this.validateName(trimmedInput)) {
          errors.push('Name contains invalid characters');
        }
        break;
      case 'school':
        if (!this.validateSchoolName(trimmedInput)) {
          errors.push('School name contains invalid characters');
        }
        break;
      case 'grade':
        if (!this.validateGrade(trimmedInput)) {
          errors.push('Invalid grade format');
        }
        break;
      case 'alphanumeric':
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
          errors.push('Only letters, numbers, hyphens, and underscores allowed');
        }
        break;
    }

    const sanitizedValue = this.sanitizeInput(trimmedInput, config?.allowSpecialChars);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  private validateName(name: string): boolean {
    return /^[a-zA-Z\s'-]{2,100}$/.test(name);
  }

  private validateSchoolName(school: string): boolean {
    return school.length >= 2 && 
           school.length <= 100 && 
           !/[<>"';()&+]/.test(school);
  }

  private validateGrade(grade: string): boolean {
    return /^([0-9]{1,2}|K)$/.test(grade);
  }

  private sanitizeInput(input: string, allowSpecialChars = false): string {
    let sanitized = input;
    
    // Remove or escape dangerous characters
    if (!allowSpecialChars) {
      sanitized = sanitized.replace(/[<>\"';&()]/g, '');
    } else {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/&/g, '&amp;');
    }
    
    return sanitized;
  }

  // Rate limiting helper
  private rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>();

  checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 300000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);
    
    if (!record) {
      this.rateLimitMap.set(identifier, { attempts: 1, lastAttempt: now });
      return true;
    }
    
    if (now - record.lastAttempt > windowMs) {
      // Reset window
      this.rateLimitMap.set(identifier, { attempts: 1, lastAttempt: now });
      return true;
    }
    
    if (record.attempts >= maxAttempts) {
      return false;
    }
    
    record.attempts++;
    record.lastAttempt = now;
    return true;
  }

  // Security audit logging
  async logSecurityEvent(eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    try {
      console.warn(`SECURITY EVENT [${severity.toUpperCase()}]: ${eventType}`, details);
      
      // In production, this would send to a secure logging service
      // For now, we'll use console logging with structured data
      const securityEvent = {
        timestamp: new Date().toISOString(),
        type: eventType,
        severity,
        details,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      };
      
      console.warn('Security Event:', JSON.stringify(securityEvent));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const securityValidationService = new SecurityValidationService();
