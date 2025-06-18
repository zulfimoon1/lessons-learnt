export class SecurityValidationService {
  validateInput(input: string, type: 'email' | 'name' | 'school' | 'grade' | 'password'): { 
    isValid: boolean; 
    sanitizedValue: string; 
    errors: string[] 
  } {
    const errors: string[] = [];
    let sanitizedValue = input?.trim() || '';

    switch (type) {
      case 'email':
        if (!sanitizedValue) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)) {
          errors.push('Invalid email format');
        }
        sanitizedValue = sanitizedValue.toLowerCase();
        break;

      case 'name':
        if (!sanitizedValue) {
          errors.push('Name is required');
        } else if (sanitizedValue.length < 2) {
          errors.push('Name must be at least 2 characters');
        } else if (sanitizedValue.length > 100) {
          errors.push('Name must be less than 100 characters');
        }
        break;

      case 'school':
        if (!sanitizedValue) {
          errors.push('School is required');
        }
        break;

      case 'grade':
        if (!sanitizedValue) {
          errors.push('Grade is required');
        }
        break;

      case 'password':
        if (!sanitizedValue) {
          errors.push('Password is required');
        } else if (sanitizedValue.length < 8) {
          errors.push('Password must be at least 8 characters');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    };
  }

  async logSecurityEvent(
    eventType: string,
    userId: string | undefined,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      // Store security events in localStorage for now
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      const newEvent = {
        type: eventType,
        userId,
        timestamp: new Date().toISOString(),
        details,
        severity
      };
      existingLogs.push(newEvent);
      
      // Keep only last 1000 events
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
      console.log(`🔒 Security event logged: ${eventType} - ${severity} - ${details}`);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const securityValidationService = new SecurityValidationService();
