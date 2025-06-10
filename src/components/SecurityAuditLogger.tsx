
import { useEffect } from 'react';
import { getCurrentUser } from '@/services/authService';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded';
  userId?: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

const SecurityAuditLogger: React.FC = () => {
  useEffect(() => {
    // Enhanced security monitoring
    const monitorSecurityEvents = () => {
      const user = getCurrentUser();
      
      // Monitor for session tampering
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'user' && e.newValue !== e.oldValue) {
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: 'Local storage tampering detected',
            userAgent: navigator.userAgent
          });
        }
      };
      
      // Monitor for suspicious navigation patterns
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const currentUser = getCurrentUser();
          if (user && !currentUser) {
            logSecurityEvent({
              type: 'suspicious_activity',
              userId: user.id,
              timestamp: new Date().toISOString(),
              details: 'Session lost while tab was hidden',
              userAgent: navigator.userAgent
            });
          }
        }
      };
      
      // Monitor for multiple rapid requests (potential automation)
      let requestCount = 0;
      const requestWindow = 60000; // 1 minute
      const maxRequests = 100; // Reasonable limit
      
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        requestCount++;
        
        // Reset counter after time window
        setTimeout(() => {
          requestCount = Math.max(0, requestCount - 1);
        }, requestWindow);
        
        if (requestCount > maxRequests) {
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: `Excessive API requests detected: ${requestCount} requests`,
            userAgent: navigator.userAgent
          });
        }
        
        return originalFetch(...args);
      };
      
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.fetch = originalFetch;
      };
    };
    
    return monitorSecurityEvents();
  }, []);

  return null; // This is a monitoring component with no UI
};

const logSecurityEvent = (event: SecurityEvent) => {
  // Enhanced logging for production monitoring
  const logEntry = {
    ...event,
    sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
    url: window.location.href,
    referrer: document.referrer
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry);
  }
  
  // In production, this should send to a secure logging service
  // Example: sendToSecurityService(logEntry);
  
  // Trigger immediate alerts for critical events
  if (event.type === 'unauthorized_access' || 
      event.type === 'suspicious_activity' || 
      event.type === 'rate_limit_exceeded') {
    console.error('CRITICAL SECURITY ALERT:', logEntry);
    
    // Could trigger immediate admin notifications here
    // Example: sendImmediateAlert(logEntry);
  }
};

// Export function for use in other components
export const logUserSecurityEvent = logSecurityEvent;

export default SecurityAuditLogger;
