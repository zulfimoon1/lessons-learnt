
import { supabase } from '@/integrations/supabase/client';

// Enhanced session management service
export const sessionService = {
  // Create a new session record for tracking
  createSession: async (userId: string, userType: 'student' | 'teacher') => {
    try {
      const sessionToken = crypto.randomUUID();
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          user_type: userType,
          user_agent: userAgent,
          ip_address: null // Client-side can't get real IP
        });

      if (error) {
        console.error('Session creation error:', error);
      }
      
      return sessionToken;
    } catch (error) {
      console.error('Session service error:', error);
      return null;
    }
  },

  // Clean up expired sessions
  cleanupExpiredSessions: async (userId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  },

  // Validate session
  validateSession: async (sessionToken: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
};
