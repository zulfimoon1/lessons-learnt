
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

class CentralizedValidationService {
  validateEmail(email: string): ValidationResult {
    return enhancedSecurityValidationService.validateInput(email, 'email');
  }

  validatePassword(password: string): ValidationResult {
    return enhancedSecurityValidationService.validatePassword(password);
  }

  validateName(name: string): ValidationResult {
    return enhancedSecurityValidationService.validateInput(name, 'name', { 
      maxLength: 100, 
      requireAlphanumeric: true 
    });
  }

  validateSchool(school: string): ValidationResult {
    return enhancedSecurityValidationService.validateInput(school, 'school', { 
      maxLength: 100, 
      requireAlphanumeric: true 
    });
  }

  validateGrade(grade: string): ValidationResult {
    return enhancedSecurityValidationService.validateInput(grade, 'grade', { 
      maxLength: 20 
    });
  }

  validateText(text: string, maxLength: number = 1000): ValidationResult {
    return enhancedSecurityValidationService.validateInput(text, 'text', { maxLength });
  }

  // Rate limiting check
  checkRateLimit(identifier: string): boolean {
    return enhancedSecurityValidationService.checkRateLimit(identifier);
  }

  // Log security events with proper type mapping
  async logSecurityEvent(event: {
    type: 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'form_validation_failed';
    userId?: string;
    details: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<void> {
    // Map to valid security event types
    const eventTypeMap: Record<string, 'suspicious_activity' | 'rate_limit_exceeded' | 'session_error'> = {
      'unauthorized_access': 'session_error',
      'suspicious_activity': 'suspicious_activity',
      'rate_limit_exceeded': 'rate_limit_exceeded',
      'form_validation_failed': 'suspicious_activity'
    };

    const mappedType = eventTypeMap[event.type] || 'suspicious_activity';
    
    await enhancedSecurityValidationService.logSecurityEvent({
      type: mappedType,
      userId: event.userId,
      details: event.details,
      severity: event.severity
    });
  }
}

export const centralizedValidationService = new CentralizedValidationService();
