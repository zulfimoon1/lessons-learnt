
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
}

export const secureSessionService = new SecureSessionService();
