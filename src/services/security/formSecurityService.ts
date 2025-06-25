
import { securityValidationService } from '../securityValidationService';
import { securityMonitoringService } from '../securityMonitoringService';

interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitized?: string;
}

interface RateLimitResult {
  allowed: boolean;
  message?: string;
  delay?: number;
}

class FormSecurityService {
  async checkRateLimit(identifier: string, action: string): Promise<RateLimitResult> {
    const allowed = securityValidationService.checkRateLimit(identifier);
    return {
      allowed,
      message: allowed ? undefined : 'Rate limit exceeded. Please try again later.',
      delay: allowed ? undefined : 1000
    };
  }

  validateAndSanitizeInput(input: string, fieldType: string): ValidationResult {
    const isValid = securityValidationService.validateInput(input);
    
    return {
      isValid,
      message: isValid ? undefined : 'Invalid input detected',
      sanitized: isValid ? input.trim() : undefined
    };
  }

  async validateSecureForm(formData: Record<string, any>, formType: string): Promise<{
    isValid: boolean;
    errors: string[];
    sanitizedData: Record<string, any>;
  }> {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const isValid = securityValidationService.validateInput(value);

        if (!isValid) {
          errors.push(`Invalid content in field: ${key}`);
        } else {
          // Basic sanitization
          sanitizedData[key] = value.trim();
        }

        // Log high-risk content detection
        if (value.includes('<script') || value.includes('javascript:')) {
          await securityValidationService.logSecurityEvent({
            type: 'suspicious_activity',
            userId: undefined,
            details: `High-risk content detected in ${formType} form field ${key}`,
            severity: 'high'
          });
        }
      } else {
        sanitizedData[key] = value;
      }
    }

    // Audit form submission
    await securityMonitoringService.auditDataAccess('form_submission', formType, 1);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }
}

export const formSecurityService = new FormSecurityService();
