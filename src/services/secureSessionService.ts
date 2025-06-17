
// Enhanced secure session management service
interface SecureSessionData {
  data: any;
  timestamp: number;
  signature: string;
}

class SecureSessionService {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly SECRET_KEY = 'lovable-session-key'; // In production, use environment variable

  // Simple signature generation for client-side validation
  private generateSignature(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  securelyStoreUserData(key: string, data: any): void {
    try {
      const timestamp = Date.now();
      const dataString = JSON.stringify(data);
      const signature = this.generateSignature(dataString + timestamp + this.SECRET_KEY);
      
      const secureData: SecureSessionData = {
        data,
        timestamp,
        signature
      };
      
      sessionStorage.setItem(`secure_${key}`, JSON.stringify(secureData));
      
      // Set session timeout
      setTimeout(() => {
        this.clearSession(key);
      }, this.SESSION_TIMEOUT);
      
    } catch (error) {
      console.error('Failed to securely store user data:', error);
    }
  }

  securelyRetrieveUserData(key: string): any | null {
    try {
      const storedData = sessionStorage.getItem(`secure_${key}`);
      if (!storedData) return null;
      
      const secureData: SecureSessionData = JSON.parse(storedData);
      const now = Date.now();
      
      // Check if session has expired
      if (now - secureData.timestamp > this.SESSION_TIMEOUT) {
        this.clearSession(key);
        return null;
      }
      
      // Verify signature
      const dataString = JSON.stringify(secureData.data);
      const expectedSignature = this.generateSignature(dataString + secureData.timestamp + this.SECRET_KEY);
      
      if (secureData.signature !== expectedSignature) {
        console.warn('Session signature verification failed');
        this.clearSession(key);
        return null;
      }
      
      return secureData.data;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      this.clearSession(key);
      return null;
    }
  }

  clearSession(key: string): void {
    sessionStorage.removeItem(`secure_${key}`);
  }

  clearAllSessions(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  isSessionValid(key: string): boolean {
    const data = this.securelyRetrieveUserData(key);
    return data !== null;
  }

  // New method to detect concurrent sessions
  detectConcurrentSessions(): boolean {
    try {
      const sessionId = sessionStorage.getItem('session_id');
      const storedSessionId = localStorage.getItem('last_session_id');
      
      if (sessionId && storedSessionId && sessionId !== storedSessionId) {
        console.warn('Concurrent session detected');
        return true;
      }
      
      // Update session tracking
      if (sessionId) {
        localStorage.setItem('last_session_id', sessionId);
      }
      
      return false;
    } catch (error) {
      console.error('Error detecting concurrent sessions:', error);
      return false;
    }
  }

  // New method to check session validity
  checkSessionValidity(): boolean {
    try {
      // Check if we have a valid session ID
      const sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        // Generate new session ID
        const newSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, byte) => 
          acc + byte.toString(16).padStart(2, '0'), ''
        );
        sessionStorage.setItem('session_id', newSessionId);
        return true;
      }
      
      // Check session fingerprint
      const fingerprint = sessionStorage.getItem('session_fingerprint');
      if (!fingerprint) {
        // Generate fingerprint
        const newFingerprint = this.generateSessionFingerprint();
        sessionStorage.setItem('session_fingerprint', newFingerprint);
        return true;
      }
      
      // Validate fingerprint hasn't changed dramatically
      const currentFingerprint = this.generateSessionFingerprint();
      const similarity = this.calculateFingerprintSimilarity(fingerprint, currentFingerprint);
      
      if (similarity < 0.8) {
        console.warn('Session fingerprint mismatch detected');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  private generateSessionFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let fingerprint = '';
      
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Security fingerprint', 2, 2);
        fingerprint += canvas.toDataURL().slice(-50);
      }
      
      // Add other browser characteristics
      fingerprint += navigator.userAgent.slice(-20);
      fingerprint += screen.width + 'x' + screen.height;
      fingerprint += new Date().getTimezoneOffset().toString();
      
      return this.generateSignature(fingerprint);
    } catch {
      return 'fallback-fingerprint';
    }
  }

  private calculateFingerprintSimilarity(fp1: string, fp2: string): number {
    if (fp1 === fp2) return 1;
    if (!fp1 || !fp2) return 0;
    
    const len = Math.max(fp1.length, fp2.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(fp1.length, fp2.length); i++) {
      if (fp1[i] === fp2[i]) matches++;
    }
    
    return matches / len;
  }
}

export const secureSessionService = new SecureSessionService();
