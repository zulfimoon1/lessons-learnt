
import { useEffect, useCallback } from 'react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';

export const useSecurityMonitoring = () => {
  const checkSession = useCallback(() => {
    const sessionCheck = enhancedSecurityService.checkSessionSecurity();
    
    if (!sessionCheck.valid) {
      console.warn('Session invalid:', sessionCheck.reason);
      enhancedSecurityService.endSession();
      
      // Redirect to login if needed
      if (window.location.pathname !== '/teacher-login' && 
          window.location.pathname !== '/student-login' &&
          window.location.pathname !== '/console') {
        window.location.href = '/teacher-login';
      }
    }
  }, []);

  const updateActivity = useCallback(() => {
    enhancedSecurityService.updateSessionActivity();
  }, []);

  useEffect(() => {
    // Check session every 5 minutes
    const sessionInterval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearInterval(sessionInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [checkSession, updateActivity]);

  return {
    checkSession,
    updateActivity,
  };
};
