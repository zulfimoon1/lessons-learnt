import { supabase } from '@/integrations/supabase/client';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface SessionFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  browserFingerprint: string;
}

interface SecureSession {
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  sessionId: string;
  fingerprint: SessionFingerprint;
  createdAt: string;
  lastActivity: string;
  csrfToken: string;
}

class EnhancedSecureSessionService {
  private sessionKey = 'secure_session';
  private csrfTokenKey = 'csrf_token';
  private fingerprintKey = 'session_fingerprint';

  // Generate browser fingerprint for session security
  private generateFingerprint(): SessionFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth,
      browserFingerprint: canvas.toDataURL()
    };
  }

  // Enhanced CSRF token generation
  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create secure session with fingerprinting
  async createSession(userId: string, userType: 'teacher' | 'student' | 'admin', school: string): Promise<SecureSession> {
    try {
      const sessionId = crypto.randomUUID();
      const fingerprint = this.generateFingerprint();
      const csrfToken = this.generateCSRFToken();
      
      const session: SecureSession = {
        userId,
        userType,
        school,
        sessionId,
        fingerprint,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        csrfToken
      };

      // Store session data securely (in production, use HTTP-only cookies)
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      sessionStorage.setItem(this.csrfTokenKey, csrfToken);
      sessionStorage.setItem(this.fingerprintKey, JSON.stringify(fingerprint));

      logUserSecurityEvent({
        type: 'session_restored',
        userId,
        timestamp: new Date().toISOString(),
        details: `Enhanced secure session created with fingerprinting`,
        userAgent: navigator.userAgent,
        sessionId
      });

      return session;
    } catch (error) {
      logUserSecurityEvent({
        type: 'session_error',
        userId,
        timestamp: new Date().toISOString(),
        details: `Failed to create enhanced secure session: ${error}`,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Validate session with fingerprint checking
  async getSession(): Promise<SecureSession | null> {
    try {
      const sessionData = sessionStorage.getItem(this.sessionKey);
      const storedFingerprint = sessionStorage.getItem(this.fingerprintKey);
      
      if (!sessionData || !storedFingerprint) {
        return null;
      }

      const session: SecureSession = JSON.parse(sessionData);
      const fingerprint: SessionFingerprint = JSON.parse(storedFingerprint);
      const currentFingerprint = this.generateFingerprint();

      // Enhanced fingerprint validation
      const fingerprintScore = this.validateFingerprint(fingerprint, currentFingerprint);
      if (fingerprintScore < 0.8) {
        logUserSecurityEvent({
          type: 'suspicious_activity',
          userId: session.userId,
          timestamp: new Date().toISOString(),
          details: `Session fingerprint mismatch detected (score: ${fingerprintScore})`,
          userAgent: navigator.userAgent,
          sessionId: session.sessionId
        });
        
        this.clearSession();
        return null;
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));

      return session;
    } catch (error) {
      logUserSecurityEvent({
        type: 'session_error',
        timestamp: new Date().toISOString(),
        details: `Session validation error: ${error}`,
        userAgent: navigator.userAgent
      });
      return null;
    }
  }

  // Enhanced fingerprint validation with scoring
  private validateFingerprint(stored: SessionFingerprint, current: SessionFingerprint): number {
    let score = 0;
    let totalChecks = 0;

    // Critical checks (higher weight)
    if (stored.userAgent === current.userAgent) score += 3;
    totalChecks += 3;

    if (stored.platform === current.platform) score += 2;
    totalChecks += 2;

    if (stored.language === current.language) score += 1;
    totalChecks += 1;

    // Less critical checks
    if (stored.screenResolution === current.screenResolution) score += 1;
    totalChecks += 1;

    if (stored.timezone === current.timezone) score += 1;
    totalChecks += 1;

    if (stored.colorDepth === current.colorDepth) score += 1;
    totalChecks += 1;

    return score / totalChecks;
  }

  // Enhanced CSRF token validation
  async validateCSRFToken(token: string): Promise<boolean> {
    try {
      const storedToken = sessionStorage.getItem(this.csrfTokenKey);
      return storedToken === token && token.length === 64;
    } catch (error) {
      logUserSecurityEvent({
        type: 'csrf_violation',
        timestamp: new Date().toISOString(),
        details: `CSRF token validation failed: ${error}`,
        userAgent: navigator.userAgent
      });
      return false;
    }
  }

  // Generate new CSRF token for forms
  getCSRFToken(): string {
    return sessionStorage.getItem(this.csrfTokenKey) || this.generateCSRFToken();
  }

  // Refresh session with security checks
  async refreshSession(session: SecureSession): Promise<SecureSession | null> {
    try {
      // Validate session age (max 24 hours)
      const sessionAge = Date.now() - new Date(session.createdAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        logUserSecurityEvent({
          type: 'session_error',
          userId: session.userId,
          timestamp: new Date().toISOString(),
          details: 'Session expired due to age limit',
          userAgent: navigator.userAgent,
          sessionId: session.sessionId
        });
        
        this.clearSession();
        return null;
      }

      // Update session activity
      session.lastActivity = new Date().toISOString();
      sessionStorage.setItem(this.sessionKey, JSON.stringify(session));

      return session;
    } catch (error) {
      logUserSecurityEvent({
        type: 'session_error',
        userId: session.userId,
        timestamp: new Date().toISOString(),
        details: `Session refresh failed: ${error}`,
        userAgent: navigator.userAgent,
        sessionId: session.sessionId
      });
      return null;
    }
  }

  // Enhanced session cleanup
  clearSession(): void {
    try {
      const sessionData = sessionStorage.getItem(this.sessionKey);
      if (sessionData) {
        const session: SecureSession = JSON.parse(sessionData);
        logUserSecurityEvent({
          type: 'logout',
          userId: session.userId,
          timestamp: new Date().toISOString(),
          details: 'Enhanced secure session cleared',
          userAgent: navigator.userAgent,
          sessionId: session.sessionId
        });
      }
    } catch (error) {
      console.error('Error logging session cleanup:', error);
    }

    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.csrfTokenKey);
    sessionStorage.removeItem(this.fingerprintKey);
    localStorage.removeItem('user');
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
    localStorage.removeItem('platformAdmin');
  }

  // Security monitoring for suspicious patterns
  async detectSuspiciousActivity(): Promise<void> {
    try {
      const session = await this.getSession();
      if (!session) return;

      // Check for rapid session changes
      const activityKey = `activity_${session.userId}`;
      const lastActivities = JSON.parse(sessionStorage.getItem(activityKey) || '[]');
      const now = Date.now();
      
      // Keep only activities from last 5 minutes
      const recentActivities = lastActivities.filter((time: number) => now - time < 5 * 60 * 1000);
      recentActivities.push(now);
      
      if (recentActivities.length > 50) {
        logUserSecurityEvent({
          type: 'suspicious_activity',
          userId: session.userId,
          timestamp: new Date().toISOString(),
          details: `Excessive session activity detected: ${recentActivities.length} activities in 5 minutes`,
          userAgent: navigator.userAgent,
          sessionId: session.sessionId
        });
      }
      
      sessionStorage.setItem(activityKey, JSON.stringify(recentActivities));
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
    }
  }
}

export const enhancedSecureSessionService = new EnhancedSecureSessionService();

}
