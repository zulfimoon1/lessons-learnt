
import { securityService } from '@/services/securityService';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'csrf_violation';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}

// Enhanced security event logging for external use
export const logUserSecurityEvent = (event: SecurityEvent): void => {
  securityService.logSecurityEvent(event);
  
  // Additional server-side logging could be implemented here
  // For now, we're using client-side logging for demonstration
  
  // In production, you would send critical events to a secure logging service
  if (['unauthorized_access', 'suspicious_activity', 'csrf_violation'].includes(event.type)) {
    console.warn('CRITICAL SECURITY EVENT:', event);
    
    // Could trigger real-time alerts to administrators
    // Could send to external security monitoring services
    // Could integrate with SIEM systems
  }
};

// Security audit functions
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
    securityService.logSecurityEvent({
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
