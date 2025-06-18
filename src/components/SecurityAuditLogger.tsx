import { useEffect } from 'react';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'csrf_violation' | 'test_admin_created' | 'forced_password_reset';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}

// Simple security event logging for external use
export const logUserSecurityEvent = (event: SecurityEvent): void => {
  try {
    const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    existingEvents.push(event);
    
    // Keep only last 100 events
    if (existingEvents.length > 100) {
      existingEvents.splice(0, existingEvents.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(existingEvents));
    
    if (['unauthorized_access', 'suspicious_activity', 'csrf_violation'].includes(event.type)) {
      console.warn('CRITICAL SECURITY EVENT:', event);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const getSecurityAuditLog = (): SecurityEvent[] => {
  try {
    return JSON.parse(localStorage.getItem('security_events') || '[]');
  } catch (error) {
    console.error('Failed to retrieve security audit log:', error);
    return [];
  }
};

export const clearSecurityAuditLog = (): void => {
  try {
    localStorage.removeItem('security_events');
    logUserSecurityEvent({
      type: 'session_restored',
      timestamp: new Date().toISOString(),
      details: 'Security audit log cleared by administrator',
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to clear security audit log:', error);
  }
};

export const exportSecurityAuditLog = (): string => {
  try {
    const events = getSecurityAuditLog();
    return JSON.stringify(events, null, 2);
  } catch (error) {
    console.error('Failed to export security audit log:', error);
    return '[]';
  }
};

const SecurityAuditLogger: React.FC = () => {
  useEffect(() => {
    logUserSecurityEvent({
      type: 'session_restored',
      timestamp: new Date().toISOString(),
      details: 'Application security monitoring initialized',
      userAgent: navigator.userAgent
    });
  }, []);

  return null;
};

export default SecurityAuditLogger;
