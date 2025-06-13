
import { useEffect } from 'react';

interface SecurityEvent {
  type: 'login' | 'logout' | 'unauthorized_access' | 'suspicious_activity';
  userId?: string;
  timestamp: string;
  details: string;
}

const SecurityMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor for suspicious activities
    const monitorSecurity = () => {
      // Check for session tampering
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'user' && e.newValue !== e.oldValue) {
          logSecurityEvent({
            type: 'suspicious_activity',
            timestamp: new Date().toISOString(),
            details: 'Local storage tampering detected'
          });
        }
      };
      
      // Monitor for multiple failed login attempts (would be enhanced with backend)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const userFromStorage = localStorage.getItem('user');
          if (!userFromStorage) {
            logSecurityEvent({
              type: 'suspicious_activity',
              timestamp: new Date().toISOString(),
              details: 'Session lost while tab was hidden'
            });
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };
    
    return monitorSecurity();
  }, []);

  return null; // This is a monitoring component with no UI
};

const logSecurityEvent = (event: SecurityEvent) => {
  // In production, this should send to a secure logging service
  console.warn('Security Event:', event);
  
  // Could also trigger alerts for administrators
  if (event.type === 'unauthorized_access' || event.type === 'suspicious_activity') {
    // Trigger security alert
    console.error('SECURITY ALERT:', event);
  }
};

export default SecurityMonitor;
