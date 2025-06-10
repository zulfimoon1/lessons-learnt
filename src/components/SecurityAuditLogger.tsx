
import { useEffect } from 'react';
import { getCurrentUser } from '@/services/authService';
import { SecurityEvent } from '@/types/auth';

const SecurityAuditLogger: React.FC = () => {
  useEffect(() => {
    // Enhanced security monitoring with improved performance
    const monitorSecurityEvents = () => {
      const user = getCurrentUser();
      
      // Monitor for session tampering with throttling
      let lastStorageCheck = 0;
      const STORAGE_CHECK_INTERVAL = 5000; // Check every 5 seconds
      
      const handleStorageChange = (e: StorageEvent) => {
        const now = Date.now();
        if (now - lastStorageCheck < STORAGE_CHECK_INTERVAL) return;
        lastStorageCheck = now;
        
        if ((e.key === 'user' || e.key === 'teacher' || e.key === 'student') && e.newValue !== e.oldValue) {
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: `Local storage tampering detected on key: ${e.key}`,
            userAgent: navigator.userAgent
          });
        }
      };
      
      // Monitor for suspicious navigation patterns with improved logic
      let visibilityCheckCount = 0;
      const MAX_VISIBILITY_CHECKS = 10; // Limit checks to prevent spam
      
      const handleVisibilityChange = () => {
        if (visibilityCheckCount >= MAX_VISIBILITY_CHECKS) return;
        visibilityCheckCount++;
        
        if (document.visibilityState === 'visible') {
          const currentUser = getCurrentUser();
          if (user && !currentUser) {
            logSecurityEvent({
              type: 'suspicious_activity',
              userId: user.id,
              timestamp: new Date().toISOString(),
              details: 'Session lost while tab was hidden - potential session hijacking',
              userAgent: navigator.userAgent
            });
          }
        }
      };
      
      // Enhanced request monitoring with sliding window
      const requestTimes: number[] = [];
      const REQUEST_WINDOW = 60000; // 1 minute
      const MAX_REQUESTS = 50; // Reduced threshold for better security
      
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const now = Date.now();
        
        // Clean old requests from sliding window
        while (requestTimes.length > 0 && now - requestTimes[0] > REQUEST_WINDOW) {
          requestTimes.shift();
        }
        
        requestTimes.push(now);
        
        if (requestTimes.length > MAX_REQUESTS) {
          logSecurityEvent({
            type: 'rate_limit_exceeded',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: `Excessive API requests detected: ${requestTimes.length} requests in last minute`,
            userAgent: navigator.userAgent
          });
        }
        
        try {
          const response = await originalFetch(...args);
          
          // Monitor for suspicious response patterns
          if (!response.ok && response.status === 401) {
            logSecurityEvent({
              type: 'unauthorized_access',
              userId: user?.id,
              timestamp: new Date().toISOString(),
              details: `Unauthorized access attempt to: ${args[0]}`,
              userAgent: navigator.userAgent
            });
          }
          
          return response;
        } catch (error) {
          // Log network errors that might indicate attacks
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: `Network error during request: ${error}`,
            userAgent: navigator.userAgent
          });
          throw error;
        }
      };
      
      // Monitor for console manipulation attempts
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('Security') || message.includes('Warning')) {
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: user?.id,
            timestamp: new Date().toISOString(),
            details: `Console security warning: ${message}`,
            userAgent: navigator.userAgent
          });
        }
        return originalConsoleWarn(...args);
      };
      
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.fetch = originalFetch;
        console.warn = originalConsoleWarn;
      };
    };
    
    return monitorSecurityEvents();
  }, []);

  return null; // This is a monitoring component with no UI
};

const logSecurityEvent = (event: SecurityEvent) => {
  // Enhanced logging with better sanitization
  const sanitizedEvent = {
    ...event,
    details: event.details.replace(/[<>\"'%;()&+]/g, ''), // Sanitize details
    sessionId: sessionStorage.getItem('sessionId') || 'anonymous',
    url: window.location.href,
    referrer: document.referrer || 'direct',
    timestamp: new Date().toISOString(),
    browserInfo: {
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled
    }
  };
  
  // In development, log to console with better formatting
  if (process.env.NODE_ENV === 'development') {
    const logLevel = event.type === 'login_success' ? 'info' : 'warn';
    console[logLevel]('🔒 Security Event:', {
      type: event.type,
      details: event.details,
      timestamp: event.timestamp,
      userId: event.userId || 'anonymous'
    });
  }
  
  // In production, this should send to a secure logging service
  // Example: sendToSecurityService(sanitizedEvent);
  
  // Trigger immediate alerts for critical events with rate limiting
  const criticalEvents = ['unauthorized_access', 'suspicious_activity', 'rate_limit_exceeded'];
  if (criticalEvents.includes(event.type)) {
    const alertKey = `security_alert_${event.type}_${Date.now()}`;
    
    // Prevent alert spam - only one alert per type per minute
    const lastAlert = sessionStorage.getItem(`last_${event.type}_alert`);
    const now = Date.now();
    
    if (!lastAlert || now - parseInt(lastAlert) > 60000) {
      console.error('🚨 CRITICAL SECURITY ALERT:', sanitizedEvent);
      sessionStorage.setItem(`last_${event.type}_alert`, now.toString());
      
      // Could trigger immediate admin notifications here
      // Example: sendImmediateAlert(sanitizedEvent);
    }
  }
};

// Export function for use in other components
export const logUserSecurityEvent = logSecurityEvent;

export default SecurityAuditLogger;
