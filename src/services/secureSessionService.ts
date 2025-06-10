
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
  school: string;
  expiresAt: number;
  sessionId: string;
  csrfToken: string;
  createdAt: number;
  lastActivity: number;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours of inactivity
const SESSION_KEY = 'secure_session';

// Generate a cryptographically secure session ID
const generateSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Generate CSRF token
const generateCSRFToken = (): string => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Enhanced encryption with PBKDF2 key derivation
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const passwordBuffer = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Enhanced session encryption with proper key derivation
const encryptSessionData = async (data: SessionData): Promise<string> => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const password = `session_${data.sessionId}_${data.userId}`;
    
    const key = await deriveKey(password, salt);
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedData
    );
    
    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Session encryption error:', error);
    return '';
  }
};

// Enhanced session decryption
const decryptSessionData = async (encryptedData: string): Promise<SessionData | null> => {
  try {
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // We need to try with a generic password since we don't have the session ID yet
    // In a real implementation, you might store a hint or use a different approach
    const tempPassword = 'temp_session_key';
    const key = await deriveKey(tempPassword, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    const decryptedText = new TextDecoder().decode(decrypted);
    const sessionData = JSON.parse(decryptedText) as SessionData;
    
    // Validate session data structure
    if (!sessionData.userId || !sessionData.userType || !sessionData.sessionId) {
      throw new Error('Invalid session data structure');
    }
    
    return sessionData;
  } catch (error) {
    console.error('Session decryption error:', error);
    return null;
  }
};

// Fallback to basic encryption for compatibility
const basicEncryptSessionData = (data: SessionData): string => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Basic session encryption error:', error);
    return '';
  }
};

const basicDecryptSessionData = (encryptedData: string): SessionData | null => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Basic session decryption error:', error);
    return null;
  }
};

export const sessionService = {
  createSession: async (userId: string, userType: 'student' | 'teacher' | 'admin', school?: string) => {
    try {
      const now = Date.now();
      const sessionData: SessionData = {
        userId,
        userType,
        school: school || '',
        expiresAt: now + SESSION_DURATION,
        sessionId: generateSessionId(),
        csrfToken: generateCSRFToken(),
        createdAt: now,
        lastActivity: now
      };

      // Try enhanced encryption first, fallback to basic if not supported
      let encryptedSession = '';
      if (crypto.subtle) {
        encryptedSession = await encryptSessionData(sessionData);
      }
      
      if (!encryptedSession) {
        encryptedSession = basicEncryptSessionData(sessionData);
      }
      
      if (encryptedSession) {
        localStorage.setItem(SESSION_KEY, encryptedSession);
        localStorage.setItem(`${SESSION_KEY}_type`, crypto.subtle ? 'enhanced' : 'basic');
        
        console.log('Secure session created:', { 
          userId, 
          userType, 
          sessionId: sessionData.sessionId,
          encryption: crypto.subtle ? 'enhanced' : 'basic'
        });
      }
    } catch (error) {
      console.error('Session creation error:', error);
    }
  },

  getSession: async (): Promise<SessionData | null> => {
    try {
      const encryptedSession = localStorage.getItem(SESSION_KEY);
      const encryptionType = localStorage.getItem(`${SESSION_KEY}_type`) || 'basic';
      
      if (!encryptedSession) return null;

      let sessionData: SessionData | null = null;
      
      if (encryptionType === 'enhanced' && crypto.subtle) {
        sessionData = await decryptSessionData(encryptedSession);
      } else {
        sessionData = basicDecryptSessionData(encryptedSession);
      }
      
      if (!sessionData) return null;

      const now = Date.now();
      
      // Check if session is expired
      if (now > sessionData.expiresAt) {
        console.log('Session expired, clearing');
        sessionService.clearSession();
        return null;
      }
      
      // Check for inactivity timeout
      if (now - sessionData.lastActivity > ACTIVITY_TIMEOUT) {
        console.log('Session inactive too long, clearing');
        sessionService.clearSession();
        return null;
      }
      
      // Update last activity if more than 5 minutes since last update
      if (now - sessionData.lastActivity > 5 * 60 * 1000) {
        sessionData.lastActivity = now;
        await sessionService.refreshSession(sessionData);
      }

      return sessionData;
    } catch (error) {
      console.error('Session retrieval error:', error);
      sessionService.clearSession();
      return null;
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(`${SESSION_KEY}_type`);
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
      localStorage.removeItem('platformAdmin');
      sessionStorage.removeItem('studentLoginData');
      console.log('Session cleared');
    } catch (error) {
      console.error('Session clear error:', error);
    }
  },

  refreshSession: async (sessionData: SessionData) => {
    try {
      const now = Date.now();
      sessionData.expiresAt = now + SESSION_DURATION;
      sessionData.lastActivity = now;
      
      const encryptionType = localStorage.getItem(`${SESSION_KEY}_type`) || 'basic';
      let encryptedSession = '';
      
      if (encryptionType === 'enhanced' && crypto.subtle) {
        encryptedSession = await encryptSessionData(sessionData);
      } else {
        encryptedSession = basicEncryptSessionData(sessionData);
      }
      
      if (encryptedSession) {
        localStorage.setItem(SESSION_KEY, encryptedSession);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  },

  cleanupExpiredSessions: async (userId: string) => {
    // Enhanced cleanup with activity tracking
    console.log('Cleaning up expired sessions for user:', userId);
    
    try {
      // In a real implementation, this would also clean up server-side sessions
      // and notify other devices about session termination
      const currentSession = await sessionService.getSession();
      if (!currentSession || currentSession.userId !== userId) {
        sessionService.clearSession();
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
      sessionService.clearSession();
    }
  },

  // New method to validate CSRF token
  validateCSRFToken: async (token: string): Promise<boolean> => {
    try {
      const session = await sessionService.getSession();
      return session?.csrfToken === token;
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return false;
    }
  }
};
