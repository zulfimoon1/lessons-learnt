import { securityService } from '../securityService';

interface SecureSession {
  id: string;
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  csrfToken: string;
  fingerprint: string;
}

interface SessionOptions {
  timeout?: number;
  extendOnActivity?: boolean;
}

class SecureSessionManager {
  private sessions = new Map<string, SecureSession>();
  private readonly SESSION_KEY = 'secure_session_v2';
  private readonly DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSIONS_PER_USER = 3;

  constructor() {
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    
    // Load existing session on startup
    this.loadExistingSession();
  }

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      canvas: canvas.toDataURL()
    }));
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private loadExistingSession(): void {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData) as SecureSession;
        if (this.isSessionValid(session)) {
          this.sessions.set(session.id, session);
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load existing session:', error);
      this.clearSession();
    }
  }

  private isSessionValid(session: SecureSession): boolean {
    const now = Date.now();
    
    // Check expiration
    if (now > session.expiresAt) {
      return false;
    }
    
    // Check activity timeout
    if (now - session.lastActivity > this.DEFAULT_TIMEOUT) {
      return false;
    }
    
    // Verify fingerprint hasn't changed significantly
    const currentFingerprint = this.generateFingerprint();
    if (session.fingerprint !== currentFingerprint) {
      console.warn('Session fingerprint mismatch detected');
      return false;
    }
    
    return true;
  }

  async createSession(
    userId: string, 
    userType: 'teacher' | 'student' | 'admin', 
    school: string,
    options: SessionOptions = {}
  ): Promise<SecureSession> {
    const now = Date.now();
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    
    // Clean up existing sessions for this user
    this.cleanupUserSessions(userId);
    
    const session: SecureSession = {
      id: this.generateSecureToken(),
      userId,
      userType,
      school,
      createdAt: now,
      expiresAt: now + (8 * 60 * 60 * 1000), // 8 hours max
      lastActivity: now,
      csrfToken: this.generateSecureToken(),
      fingerprint: this.generateFingerprint()
    };

    this.sessions.set(session.id, session);
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Session storage failed');
    }

    securityService.logSecurityEvent({
      type: 'session_restored',
      timestamp: new Date().toISOString(),
      details: `Secure session created for ${userType}`,
      userAgent: navigator.userAgent
    });

    return session;
  }

  getCurrentSession(): SecureSession | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData) as SecureSession;
      
      if (!this.isSessionValid(session)) {
        this.clearSession();
        return null;
      }
      
      // Update last activity
      session.lastActivity = Date.now();
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      this.clearSession();
      return null;
    }
  }

  validateCSRFToken(token: string): boolean {
    const session = this.getCurrentSession();
    return session?.csrfToken === token;
  }

  refreshSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !this.isSessionValid(session)) {
      return false;
    }
    
    const now = Date.now();
    session.lastActivity = now;
    session.expiresAt = Math.max(session.expiresAt, now + this.DEFAULT_TIMEOUT);
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      this.sessions.clear();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (!this.isSessionValid(session)) {
        this.sessions.delete(id);
      }
    }
  }

  private cleanupUserSessions(userId: string): void {
    const userSessions = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .sort(([_, a], [__, b]) => b.lastActivity - a.lastActivity);
    
    // Keep only the most recent sessions
    if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
      userSessions.slice(this.MAX_SESSIONS_PER_USER - 1).forEach(([id]) => {
        this.sessions.delete(id);
      });
    }
  }

  getSessionInfo(): { 
    hasSession: boolean; 
    sessionAge?: number; 
    timeUntilExpiry?: number;
    csrfToken?: string;
  } {
    const session = this.getCurrentSession();
    if (!session) {
      return { hasSession: false };
    }
    
    const now = Date.now();
    return {
      hasSession: true,
      sessionAge: now - session.createdAt,
      timeUntilExpiry: session.expiresAt - now,
      csrfToken: session.csrfToken
    };
  }
}

export const secureSessionManager = new SecureSessionManager();
