
import { securityService } from '../securityService';

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowedChars?: RegExp;
  blockedPatterns?: RegExp[];
  customRules?: ((input: string) => string[])[];
}

class EnhancedInputValidator {
  private readonly XSS_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /expression\s*\(/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi
  ];

  private readonly SQL_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
    /'\s*(or|and)\s+'[^']*'/gi,
    /\b(information_schema|sys\.)\w+/gi
  ];

  private readonly COMMON_ATTACKS = [
    /\.\.\//g,  // Directory traversal
    /\$\{.*\}/g, // Template injection
    /@import/gi, // CSS import
    /url\s*\(/gi, // URL functions
    /eval\s*\(/gi, // Eval functions
  ];

  validateInput(input: string, type: string, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    let sanitized = input;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Basic validation
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        sanitized: '',
        errors: ['Input is required and must be a string'],
        riskLevel: 'medium'
      };
    }

    // Length validation
    const maxLength = options.maxLength || 1000;
    const minLength = options.minLength || 1;
    
    if (input.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    if (input.length < minLength) {
      errors.push(`Input must be at least ${minLength} characters`);
    }

    // XSS Detection
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(input)) {
        errors.push('Potentially malicious script content detected');
        riskLevel = 'high';
        break;
      }
    }

    // SQL Injection Detection
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(input)) {
        errors.push('Potentially malicious SQL patterns detected');
        riskLevel = 'high';
        break;
      }
    }

    // Common Attack Patterns
    for (const pattern of this.COMMON_ATTACKS) {
      if (pattern.test(input)) {
        errors.push('Potentially malicious patterns detected');
        riskLevel = 'high';
        break;
      }
    }

    // Type-specific validation
    switch (type.toLowerCase()) {
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(input)) {
          errors.push('Invalid email format');
        }
        break;
        
      case 'name':
        const nameRegex = /^[a-zA-Z\s\-'\.]{1,100}$/;
        if (!nameRegex.test(input)) {
          errors.push('Name contains invalid characters');
        }
        break;
        
      case 'school':
        const schoolRegex = /^[a-zA-Z0-9\s\-'\.&]{1,100}$/;
        if (!schoolRegex.test(input)) {
          errors.push('School name contains invalid characters');
        }
        break;
        
      case 'grade':
        const gradeRegex = /^(K|Kindergarten|Grade\s*\d{1,2}|\d{1,2})$/i;
        if (!gradeRegex.test(input)) {
          errors.push('Invalid grade format');
        }
        break;
    }

    // Custom validation rules
    if (options.customRules) {
      for (const rule of options.customRules) {
        const ruleErrors = rule(input);
        errors.push(...ruleErrors);
      }
    }

    // Sanitization
    sanitized = this.sanitizeInput(input);

    // Log security events for high-risk inputs
    if (riskLevel === 'high') {
      securityService.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `High-risk input detected in ${type}: ${errors.join(', ')}`,
        userAgent: navigator.userAgent
      });
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
      riskLevel
    };
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
  }

  validatePassword(password: string, gradeLevel?: number): ValidationResult {
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (!password) {
      return {
        isValid: false,
        sanitized: '',
        errors: ['Password is required'],
        riskLevel: 'high'
      };
    }

    // Age-appropriate requirements
    const minLength = gradeLevel && gradeLevel <= 3 ? 4 : 
                     gradeLevel && gradeLevel <= 6 ? 6 : 
                     gradeLevel && gradeLevel <= 9 ? 7 : 8;

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'letmein', 
      'welcome', 'monkey', 'dragon', 'password123', '12345678'
    ];
    
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('Password contains common weak patterns');
      riskLevel = 'medium';
    }

    // Check for repeated characters
    if (/(.)\1{3,}/.test(password)) {
      errors.push('Password contains too many repeated characters');
    }

    return {
      isValid: errors.length === 0,
      sanitized: password, // Don't modify passwords
      errors,
      riskLevel
    };
  }

  // Rate limiting for validation requests
  private validationAttempts = new Map<string, { count: number; timestamp: number }>();
  
  checkValidationRateLimit(identifier: string): boolean {
    const now = Date.now();
    const key = `validation_${identifier}`;
    const attempt = this.validationAttempts.get(key);
    
    if (!attempt) {
      this.validationAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }
    
    // Reset if more than 1 minute has passed
    if (now - attempt.timestamp > 60000) {
      this.validationAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }
    
    // Allow up to 100 validation attempts per minute
    if (attempt.count >= 100) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
}

export const enhancedInputValidator = new EnhancedInputValidator();
