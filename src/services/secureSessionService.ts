
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced session management with security features
class SecureSessionService {
  private sessionFingerprint: string | null = null;
  private sessionStartTime: number = Date.now();
  private maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours
  private inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  private lastActivity: number = Date.now();

  constructor() {
    this.generateSessionFingerprint();
    this.setupActivityMonitoring();
    this.setupVisibilityMonitoring();
  }

  private generateSessionFingerprint(): void {
    try {
      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timestamp: Date.now()
      };
      
      this.sessionFingerprint = btoa(JSON.stringify(fingerprint));
      sessionStorage.setItem('session_fingerprint', this.sessionFingerprint);
    } catch (error) {
      console.warn('Failed to generate session fingerprint:', error);
    }
  }

  private setupActivityMonitoring(): void {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for inactivity every minute
    setInterval(() => {
      this.checkSessionValidity();
    }, 60000);
  }

  private setupVisibilityMonitoring(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.validateSessionOnFocus();
      }
    });
  }

  private validateSessionOnFocus(): void {
    const storedFingerprint = sessionStorage.getItem('session_fingerprint');
    
    if (!storedFingerprint || storedFingerprint !== this.sessionFingerprint) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: 'Session fingerprint mismatch detected',
        userAgent: navigator.userAgent
      });
      
      this.invalidateSession('fingerprint_mismatch');
    }
  }

  public checkSessionValidity(): boolean {
    const now = Date.now();
    
    // Check session duration
    if (now - this.sessionStartTime > this.maxSessionDuration) {
      this.invalidateSession('session_expired');
      return false;
    }
    
    // Check inactivity
    if (now - this.lastActivity > this.inactivityTimeout) {
      this.invalidateSession('inactivity_timeout');
      return false;
    }
    
    return true;
  }

  private invalidateSession(reason: string): void {
    logUserSecurityEvent({
      type: 'logout',
      timestamp: new Date().toISOString(),
      details: `Session invalidated: ${reason}`,
      userAgent: navigator.userAgent
    });

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/';
  }

  public securelyStoreUserData(key: string, data: any): void {
    try {
      const encryptedData = this.encryptData(JSON.stringify(data));
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.warn('Failed to securely store user data:', error);
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Failed to store user data: ${error}`,
        userAgent: navigator.userAgent
      });
    }
  }

  public securelyRetrieveUserData(key: string): any {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;
      
      const decryptedData = this.decryptData(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.warn('Failed to retrieve user data:', error);
      localStorage.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  private encryptData(data: string): string {
    // Simple XOR encryption for client-side storage
    // In production, consider using Web Crypto API for stronger encryption
    const key = this.sessionFingerprint || 'fallback_key';
    let encrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return btoa(encrypted);
  }

  private decryptData(encryptedData: string): string {
    const key = this.sessionFingerprint || 'fallback_key';
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return decrypted;
  }

  public detectConcurrentSessions(): boolean {
    const sessionId = sessionStorage.getItem('session_id');
    const storedSessionId = localStorage.getItem('current_session_id');
    
    if (sessionId && storedSessionId && sessionId !== storedSessionId) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: 'Concurrent session detected',
        userAgent: navigator.userAgent
      });
      return true;
    }
    
    // Set current session as active
    if (!sessionId) {
      const newSessionId = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
      sessionStorage.setItem('session_id', newSessionId);
      localStorage.setItem('current_session_id', newSessionId);
    }
    
    return false;
  }
}

export const secureSessionService = new SecureSessionService();
