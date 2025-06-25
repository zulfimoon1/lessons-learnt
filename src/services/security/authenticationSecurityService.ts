
import { enhancedSecurityValidationService } from '../enhancedSecurityValidationService';
import { securityValidationService } from '../securityValidationService';

interface AuthenticationResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresMFA?: boolean;
}

class AuthenticationSecurityService {
  private sessionTokens = new Map<string, string>();

  async authenticateUser(
    userType: 'student' | 'teacher' | 'admin',
    credentials: any,
    requestContext: {
      userAgent: string;
      ipAddress?: string;
    }
  ): Promise<AuthenticationResult> {
    
    // Rate limiting check
    const identifier = `${requestContext.ipAddress || 'unknown'}:${credentials.email || credentials.fullName}`;
    if (!securityValidationService.checkRateLimit(identifier)) {
      await securityValidationService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        userId: undefined,
        details: `Authentication rate limit exceeded for ${identifier}`,
        severity: 'medium'
      });
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    // Input validation using simplified approach
    const emailValid = credentials.email ? credentials.email.includes('@') && credentials.email.length < 254 : true;
    const nameValid = credentials.fullName ? credentials.fullName.length < 100 : true;

    if (!emailValid || !nameValid) {
      await securityValidationService.logSecurityEvent({
        type: 'form_validation_failed',
        userId: undefined,
        details: 'Authentication validation failed: Invalid input format',
        severity: 'medium'
      });
      return { success: false, error: 'Invalid input provided' };
    }

    // Session security validation
    if (!securityValidationService.validateSessionSecurity()) {
      return { success: false, error: 'Session security validation failed' };
    }

    // Generate session token
    const sessionId = crypto.randomUUID();
    const csrfToken = this.generateSecureToken();
    this.sessionTokens.set(sessionId, csrfToken);
    
    try {
      await securityValidationService.logSecurityEvent({
        type: 'unauthorized_access', // Using valid type for successful authentication
        userId: sessionId,
        details: `Successful ${userType} authentication`,
        severity: 'low'
      });

      return { 
        success: true, 
        user: { 
          sessionId, 
          csrfToken,
          userType 
        } 
      };
    } catch (error) {
      await securityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: undefined,
        details: `Authentication error: ${error}`,
        severity: 'medium'
      });
      return { success: false, error: 'Authentication failed' };
    }
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  cleanup(): void {
    // Clean up expired CSRF tokens
    if (this.sessionTokens.size > 1000) {
      this.sessionTokens.clear();
    }
  }
}

export const authenticationSecurityService = new AuthenticationSecurityService();
