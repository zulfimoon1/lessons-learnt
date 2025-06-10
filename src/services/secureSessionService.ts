
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  userId: string;
  userType: 'student' | 'teacher' | 'admin';
  school: string;
  expiresAt: number;
  sessionId: string;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_KEY = 'secure_session';

// Generate a secure session ID
const generateSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Encrypt session data (basic implementation - in production use proper encryption)
const encryptSessionData = (data: SessionData): string => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Session encryption error:', error);
    return '';
  }
};

// Decrypt session data
const decryptSessionData = (encryptedData: string): SessionData | null => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Session decryption error:', error);
    return null;
  }
};

export const sessionService = {
  createSession: async (userId: string, userType: 'student' | 'teacher' | 'admin', school?: string) => {
    try {
      const sessionData: SessionData = {
        userId,
        userType,
        school: school || '',
        expiresAt: Date.now() + SESSION_DURATION,
        sessionId: generateSessionId()
      };

      const encryptedSession = encryptSessionData(sessionData);
      if (encryptedSession) {
        localStorage.setItem(SESSION_KEY, encryptedSession);
        
        // Log session creation for audit
        console.log('Secure session created:', { userId, userType, sessionId: sessionData.sessionId });
      }
    } catch (error) {
      console.error('Session creation error:', error);
    }
  },

  getSession: (): SessionData | null => {
    try {
      const encryptedSession = localStorage.getItem(SESSION_KEY);
      if (!encryptedSession) return null;

      const sessionData = decryptSessionData(encryptedSession);
      if (!sessionData) return null;

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        sessionService.clearSession();
        return null;
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
      localStorage.removeItem('teacher');
      localStorage.removeItem('student');
      localStorage.removeItem('platformAdmin');
      console.log('Session cleared');
    } catch (error) {
      console.error('Session clear error:', error);
    }
  },

  refreshSession: (sessionData: SessionData) => {
    try {
      sessionData.expiresAt = Date.now() + SESSION_DURATION;
      const encryptedSession = encryptSessionData(sessionData);
      if (encryptedSession) {
        localStorage.setItem(SESSION_KEY, encryptedSession);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  },

  cleanupExpiredSessions: async (userId: string) => {
    // This would clean up server-side sessions in a full implementation
    console.log('Cleaning up expired sessions for user:', userId);
  }
};
