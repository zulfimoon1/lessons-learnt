
export class SecurityValidationService {
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();

  validateInput(input: string, type: string, options: { 
    maxLength?: number; 
    allowHtml?: boolean; 
    requireAlphanumeric?: boolean 
  } = {}): { 
    isValid: boolean; 
    sanitizedValue: string; 
    errors: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const errors: string[] = [];
    let sanitizedValue = input?.trim() || '';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Convert dynamic type to known types for validation
    const validationType = this.mapToValidationType(type);

    switch (validationType) {
      case 'email':
        if (!sanitizedValue) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)) {
          errors.push('Invalid email format');
          riskLevel = 'medium';
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

      default:
        // Generic text validation
        if (options.maxLength && sanitizedValue.length > options.maxLength) {
          errors.push(`Input must be less than ${options.maxLength} characters`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
      riskLevel
    };
  }

  private mapToValidationType(type: string): 'email' | 'name' | 'school' | 'grade' | 'password' | 'text' {
    switch (type.toLowerCase()) {
      case 'email':
        return 'email';
      case 'name':
      case 'full_name':
      case 'fullname':
        return 'name';
      case 'school':
        return 'school';
      case 'grade':
        return 'grade';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  }

  checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
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

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateSessionSecurity(): boolean {
    try {
      const hasSecureContext = window.isSecureContext;
      const hasSessionStorage = typeof sessionStorage !== 'undefined';
      return hasSecureContext && hasSessionStorage;
    } catch (error) {
      console.error('Session security validation failed:', error);
      return false;
    }
  }

  async logSecurityEvent(
    eventType: string,
    userId: string | undefined,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      const newEvent = {
        type: eventType,
        userId,
        timestamp: new Date().toISOString(),
        details,
        severity
      };
      existingLogs.push(newEvent);
      
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
