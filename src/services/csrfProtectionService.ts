
import { centralizedValidationService } from './centralizedValidationService';

interface CSRFToken {
  token: string;
  timestamp: number;
  sessionId: string;
}

class CSRFProtectionService {
  private tokens = new Map<string, CSRFToken>();
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  generateCSRFToken(sessionId: string): string {
    const token = this.generateSecureToken();
    
    this.tokens.set(token, {
      token,
      timestamp: Date.now(),
      sessionId
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  validateCSRFToken(token: string, sessionId: string): boolean {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: 'CSRF token validation failed - token not found',
        severity: 'high'
      });
      return false;
    }

    if (tokenData.sessionId !== sessionId) {
      centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: 'CSRF token validation failed - session mismatch',
        severity: 'high'
      });
      return false;
    }

    if (Date.now() - tokenData.timestamp > this.TOKEN_EXPIRY) {
      centralizedValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: 'CSRF token validation failed - token expired',
        severity: 'medium'
      });
      this.tokens.delete(token);
      return false;
    }

    // Token is valid, remove it (one-time use)
    this.tokens.delete(token);
    return true;
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, tokenData] of this.tokens.entries()) {
      if (now - tokenData.timestamp > this.TOKEN_EXPIRY) {
        this.tokens.delete(token);
      }
    }
  }

  // Get current session ID (simplified for demo)
  getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('csrf_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('csrf_session_id', sessionId);
    }
    return sessionId;
  }
}

export const csrfProtectionService = new CSRFProtectionService();
