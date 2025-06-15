
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

interface SecureSession {
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  csrfToken: string;
  sessionId: string;
  expiresAt: number;
  fingerprint: string;
}

class EnhancedSecureSessionService {
  private sessionKey = 'enhanced_secure_session';
  private maxSessionDuration = 4 * 60 * 60 * 1000; // 4 hours

  async createSession(
    userId: string,
    userType: 'teacher' | 'student' | 'admin',
    school: string
  ): Promise<SecureSession> {
    const session: SecureSession = {
      userId,
      userType,
      school,
      csrfToken: enhancedSecurityValidationService.generateCSRFToken(),
      sessionId: crypto.randomUUID(),
      expiresAt: Date.now() + this.maxSessionDuration,
      fingerprint: this.generateFingerprint()
    };

    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    
    await enhancedSecurityValidationService.logSecurityEvent({
      type: 'suspicious_activity', // Using valid enum value for session creation
      userId,
      details: 'Enhanced secure session created',
      severity: 'low'
    });

    return session;
  }

  async getSession(): Promise<SecureSession | null> {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      if (!stored) return null;

      const session: SecureSession = JSON.parse(stored);
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      // Validate fingerprint
      const currentFingerprint = this.generateFingerprint();
      if (session.fingerprint !== currentFingerprint) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          userId: session.userId,
          details: 'Session fingerprint mismatch detected',
          severity: 'high'
        });
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session retrieval error:', error);
      this.clearSession();
      return null;
    }
  }

  async refreshSession(session: SecureSession): Promise<SecureSession | null> {
    try {
      session.expiresAt = Date.now() + this.maxSessionDuration;
      session.csrfToken = enhancedSecurityValidationService.generateCSRFToken();
      
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  }

  clearSession(): void {
    sessionStorage.removeItem(this.sessionKey);
  }

  getCSRFToken(): string {
    return enhancedSecurityValidationService.generateCSRFToken();
  }

  private generateFingerprint(): string {
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`
    }));
  }

  async detectSuspiciousActivity(): Promise<void> {
    const isSuspicious = enhancedSecurityValidationService.detectSuspiciousActivity();
    if (isSuspicious) {
      this.clearSession();
    }
  }
}

export const enhancedSecureSessionService = new EnhancedSecureSessionService();
