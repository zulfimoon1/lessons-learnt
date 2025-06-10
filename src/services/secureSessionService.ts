
import { supabase } from '@/integrations/supabase/client';

// Enhanced session management service using localStorage for client-side session tracking
export const sessionService = {
  // Create a new session record for tracking using localStorage
  createSession: async (userId: string, userType: 'student' | 'teacher') => {
    try {
      const sessionToken = crypto.randomUUID();
      const userAgent = navigator.userAgent;
      
      // Store session info in localStorage for client-side tracking
      const sessionData = {
        user_id: userId,
        session_token: sessionToken,
        user_type: userType,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      localStorage.setItem(`session_${userId}`, JSON.stringify(sessionData));
      localStorage.setItem('current_session_token', sessionToken);
      
      console.log('Session created for user:', userId);
      return sessionToken;
    } catch (error) {
      console.error('Session service error:', error);
      return null;
    }
  },

  // Clean up expired sessions from localStorage
  cleanupExpiredSessions: async (userId: string) => {
    try {
      const sessionKey = `session_${userId}`;
      const sessionData = localStorage.getItem(sessionKey);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        
        if (now > expiresAt) {
          localStorage.removeItem(sessionKey);
          console.log('Expired session cleaned up for user:', userId);
        }
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  },

  // Validate session using localStorage
  validateSession: async (sessionToken: string): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem('current_session_token');
      
      if (currentToken !== sessionToken) {
        return false;
      }
      
      // Find session data by iterating through localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('session_')) {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.session_token === sessionToken) {
              const now = new Date();
              const expiresAt = new Date(session.expires_at);
              return now <= expiresAt;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
};
