
interface SecureSession {
  userId: string;
  userType: 'teacher' | 'student' | 'admin';
  school: string;
  sessionId: string;
  csrfToken: string;
  expiresAt: number;
  fingerprint: string;
  createdAt: number;
}

class SecureSessionService {
  private readonly sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours for security
  private readonly mentalHealthTimeout = 30 * 60 * 1000; // 30 minutes for mental health data

  /**
   * Generate environment-based session key
   */
  private getSessionKey(): string {
    const baseKey = 'secure_session';
    const envHash = this.hashString(window.location.origin);
    return `${baseKey}_${envHash}`;
  }

  /**
   * Generate device fingerprint for session validation
   */
  private generateFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.platform
    ];
    
    return this.hashString(components.join('|'));
  }

  /**
   * Simple hash function for fingerprinting
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate secure CSRF token
   */
  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt session data (basic encryption for sensitive data)
   */
  private encryptSessionData(data: string): string {
    // Basic XOR encryption with session key
    const key = this.getSessionKey();
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Decrypt session data
   */
  private decryptSessionData(encryptedData: string): string {
    try {
      const key = this.getSessionKey();
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Session decryption failed:', error);
      return '';
    }
  }

  /**
   * Create secure session with encryption
   */
  createSecureSession(
    userId: string, 
    userType: 'teacher' | 'student' | 'admin', 
    school: string,
    isMentalHealthAccess: boolean = false
  ): SecureSession {
    const timeout = isMentalHealthAccess ? this.mentalHealthTimeout : this.sessionTimeout;
    
    const session: SecureSession = {
      userId,
      userType,
      school,
      sessionId: crypto.randomUUID(),
      csrfToken: this.generateCSRFToken(),
      expiresAt: Date.now() + timeout,
      fingerprint: this.generateFingerprint(),
      createdAt: Date.now()
    };

    // Store encrypted session in sessionStorage (more secure than localStorage)
    const encryptedSession = this.encryptSessionData(JSON.stringify(session));
    sessionStorage.setItem(this.getSessionKey(), encryptedSession);

    return session;
  }

  /**
   * Get and validate secure session
   */
  getSecureSession(): SecureSession | null {
    try {
      const encryptedSession = sessionStorage.getItem(this.getSessionKey());
      if (!encryptedSession) return null;

      const sessionData = this.decryptSessionData(encryptedSession);
      if (!sessionData) return null;

      const session: SecureSession = JSON.parse(sessionData);

      // Validate expiration
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      // Validate fingerprint
      if (session.fingerprint !== this.generateFingerprint()) {
        console.warn('Session fingerprint mismatch - potential security threat');
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Refresh session with new expiration and CSRF token
   */
  refreshSession(isMentalHealthAccess: boolean = false): boolean {
    const session = this.getSecureSession();
    if (!session) return false;

    const timeout = isMentalHealthAccess ? this.mentalHealthTimeout : this.sessionTimeout;
    session.expiresAt = Date.now() + timeout;
    session.csrfToken = this.generateCSRFToken();

    const encryptedSession = this.encryptSessionData(JSON.stringify(session));
    sessionStorage.setItem(this.getSessionKey(), encryptedSession);

    return true;
  }

  /**
   * Clear session securely
   */
  clearSession(): void {
    sessionStorage.removeItem(this.getSessionKey());
    
    // Clear any legacy localStorage items
    ['student', 'teacher', 'platformAdmin', 'auth_token', 'user_session'].forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Validate session for mental health data access
   */
  validateMentalHealthAccess(userRole: string): boolean {
    const session = this.getSecureSession();
    if (!session) return false;

    // Only doctors and admins can access mental health data
    return ['doctor', 'admin'].includes(userRole);
  }

  /**
   * Get current CSRF token
   */
  getCSRFToken(): string {
    const session = this.getSecureSession();
    return session?.csrfToken || '';
  }
}

export const secureSessionService = new SecureSessionService();
