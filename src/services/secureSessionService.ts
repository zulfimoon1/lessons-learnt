
import { supabase } from '@/integrations/supabase/client';

interface SecureSession {
  sessionId: string;
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  createdAt: number;
  lastActivity: number;
  fingerprint: string;
}

class SecureSessionService {
  private static readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_KEY = 'secure_session';

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Session fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  async createSession(userId: string, userType: 'teacher' | 'student' | 'admin', school: string): Promise<SecureSession> {
    const session: SecureSession = {
      sessionId: crypto.randomUUID(),
      userId,
      userType,
      school,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      fingerprint: this.generateFingerprint()
    };

    // Store in secure storage
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    // Log session creation
    await this.logSecurityEvent('session_created', userId, `Session created for ${userType}`, 'low');
    
    return session;
  }

  getSession(): SecureSession | null {
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session: SecureSession = JSON.parse(stored);
      const now = Date.now();

      // Check session timeout
      if (now - session.createdAt > this.SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }

      // Check activity timeout
      if (now - session.lastActivity > this.ACTIVITY_TIMEOUT) {
        this.clearSession();
        return null;
      }

      // Validate fingerprint
      if (session.fingerprint !== this.generateFingerprint()) {
        this.clearSession();
        this.logSecurityEvent('session_hijack_attempt', session.userId, 'Fingerprint mismatch detected', 'high');
        return null;
      }

      // Update activity
      session.lastActivity = now;
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return null;
    }
  }

  async refreshSession(): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;

    session.lastActivity = Date.now();
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return true;
  }

  clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  private async logSecurityEvent(eventType: string, userId: string, details: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    try {
      await supabase.rpc('log_security_event_safe', {
        event_type: eventType,
        user_id: userId,
        details,
        severity
      });
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }
}

export const secureSessionService = new SecureSessionService();
