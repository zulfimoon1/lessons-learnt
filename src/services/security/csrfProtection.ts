
import { secureSessionManager } from './secureSessionManager';
import { securityMonitor } from './securityMonitor';

interface CSRFConfig {
  tokenName: string;
  headerName: string;
  expiryMinutes: number;
}

class CSRFProtection {
  private readonly config: CSRFConfig = {
    tokenName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    expiryMinutes: 30
  };

  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  getToken(): string {
    const session = secureSessionManager.getCurrentSession();
    if (!session) {
      throw new Error('No active session for CSRF token generation');
    }
    
    return session.csrfToken;
  }

  validateToken(token: string, request?: Request): boolean {
    try {
      if (!token) {
        securityMonitor.logSecurityEvent({
          type: 'csrf_validation_failed',
          severity: 'medium',
          details: 'CSRF token missing',
          userAgent: navigator.userAgent
        });
        return false;
      }

      const isValid = secureSessionManager.validateCSRFToken(token);
      
      if (!isValid) {
        securityMonitor.logSecurityEvent({
          type: 'csrf_validation_failed',
          severity: 'high',
          details: 'CSRF token validation failed - possible attack attempt',
          userAgent: navigator.userAgent
        });
      }

      return isValid;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'csrf_validation_error',
        severity: 'medium',
        details: `CSRF validation error: ${error}`,
        userAgent: navigator.userAgent
      });
      return false;
    }
  }

  // Middleware for fetch requests
  withCSRFProtection(url: string, options: RequestInit = {}): RequestInit {
    try {
      const token = this.getToken();
      
      return {
        ...options,
        headers: {
          ...options.headers,
          [this.config.headerName]: token,
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.warn('Failed to add CSRF protection to request:', error);
      return options;
    }
  }

  // Validate CSRF for forms
  validateFormSubmission(form: HTMLFormElement): boolean {
    const tokenInput = form.querySelector(`input[name="${this.config.tokenName}"]`) as HTMLInputElement;
    const token = tokenInput?.value;
    
    return this.validateToken(token || '');
  }

  // Add CSRF token to forms
  protectForm(form: HTMLFormElement): void {
    try {
      const token = this.getToken();
      
      // Remove existing CSRF token input if present
      const existingInput = form.querySelector(`input[name="${this.config.tokenName}"]`);
      if (existingInput) {
        existingInput.remove();
      }
      
      // Add new CSRF token input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.config.tokenName;
      input.value = token;
      form.appendChild(input);
    } catch (error) {
      console.warn('Failed to protect form with CSRF token:', error);
    }
  }

  // Check if request is same-origin
  private isSameOrigin(url: string): boolean {
    try {
      const requestURL = new URL(url, window.location.origin);
      return requestURL.origin === window.location.origin;
    } catch (error) {
      return false;
    }
  }

  // Double submit cookie pattern validation
  validateDoubleSubmit(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) {
      return false;
    }
    
    return cookieToken === headerToken && this.validateToken(headerToken);
  }

  // Generate a new token and update session
  rotateToken(): string {
    const session = secureSessionManager.getCurrentSession();
    if (!session) {
      throw new Error('No active session for token rotation');
    }
    
    const newToken = this.generateToken();
    session.csrfToken = newToken;
    
    // Update session storage
    try {
      sessionStorage.setItem('secure_session_v2', JSON.stringify(session));
    } catch (error) {
      console.error('Failed to update session with new CSRF token:', error);
    }
    
    return newToken;
  }
}

export const csrfProtection = new CSRFProtection();
