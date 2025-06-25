
import { securityValidationService } from './securityValidationService';

interface SecureSession {
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  csrfToken: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

class EnhancedSecureSessionService {
  private readonly SESSION_KEY = 'secure_session';
  private readonly CSRF_KEY = 'csrf_token';
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Generate secure session token
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Generate CSRF token
  getCSRFToken(): string {
    let token = sessionStorage.getItem(this.CSRF_KEY);
    if (!token) {
      token = this.generateSecureToken();
      sessionStorage.setItem(this.CSRF_KEY, token);
    }
    return token;
  }

  // Create secure session
  async createSession(userId: string, userType: 'teacher' | 'student' | 'admin', school: string): Promise<SecureSession> {
    const now = Date.now();
    const session: SecureSession = {
      userId,
      userType,
      school,
      csrfToken: this.getCSRFToken(),
      sessionId: this.generateSecureToken(),
      createdAt: now,
      expiresAt: now + this.SESSION_DURATION,
      lastActivity: now
    };

    // Store session securely
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('✅ Secure session created:', { userId, userType, school });
      return session;
    } catch (error) {
      console.error('Failed to create secure session:', error);
      throw new Error('Session creation failed');
    }
  }

  // Get current session
  async getSession(): Promise<SecureSession | null> {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session: SecureSession = JSON.parse(sessionData);
      const now = Date.now();

      // Check if session is expired
      if (now > session.expiresAt) {
        console.warn('Session expired');
        this.clearSession();
        return null;
      }

      // Check if session is inactive
      if (now - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        console.warn('Session inactive timeout');
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession();
      return null;
    }
  }

  // Refresh session activity
  async refreshSession(session: SecureSession): Promise<SecureSession | null> {
    try {
      const now = Date.now();
      
      // Update last activity
      session.lastActivity = now;
      
      // Extend expiration if needed
      if (session.expiresAt - now < this.SESSION_DURATION / 2) {
        session.expiresAt = now + this.SESSION_DURATION;
      }

      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
  }

  // Clear session
  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.CSRF_KEY);
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Validate CSRF token
  validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.CSRF_KEY);
    return storedToken === token && token.length > 0;
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(): Promise<void> {
    const session = await this.getSession();
    if (!session) return;

    // Check for multiple rapid requests (simple rate limiting)
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    
    if (timeSinceLastActivity < 100) { // Less than 100ms between requests
      console.warn('Suspicious activity detected: Rapid requests');
      // Log security event but don't clear session immediately
      securityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        userId: session.userId,
        details: 'Rapid successive requests detected',
        severity: 'medium'
      });
    }

    // Check session age
    const sessionAge = now - session.createdAt;
    if (sessionAge > this.SESSION_DURATION) {
      console.warn('Session exceeded maximum duration');
      this.clearSession();
    }
  }

  // Get session info for debugging
  getSessionInfo(): { hasSession: boolean; sessionAge?: number; timeUntilExpiry?: number } {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return { hasSession: false };
      }

      const session: SecureSession = JSON.parse(sessionData);
      const now = Date.now();

      return {
        hasSession: true,
        sessionAge: now - session.createdAt,
        timeUntilExpiry: session.expiresAt - now
      };
    } catch (error) {
      return { hasSession: false };
    }
  }
}

export const enhancedSecureSessionService = new EnhancedSecureSessionService();
