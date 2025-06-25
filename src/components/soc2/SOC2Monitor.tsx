
import React, { useEffect } from 'react';
import { soc2ComplianceService } from '@/services/soc2ComplianceService';
import { getCurrentUser } from '@/services/authService';

interface SOC2MonitorProps {
  children: React.ReactNode;
}

const SOC2Monitor: React.FC<SOC2MonitorProps> = ({ children }) => {
  useEffect(() => {
    // Initialize SOC 2 monitoring
    const initializeMonitoring = () => {
      console.log('🛡️ SOC 2 monitoring initialized');
      
      // Log application start event
      soc2ComplianceService.logAuditEvent({
        event_type: 'application_start',
        resource_accessed: 'system',
        action_performed: 'initialize',
        result: 'success',
        severity: 'low',
        control_category: 'availability',
        details: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });

      // Record initial availability metric
      soc2ComplianceService.recordAvailabilityMetric(
        'web_application',
        'up',
        undefined,
        100,
        0,
        1,
        { startup: true }
      );
    };

    // Monitor page visibility changes
    const handleVisibilityChange = () => {
      const user = getCurrentUser();
      
      if (document.hidden) {
        soc2ComplianceService.logAuditEvent({
          event_type: 'session_backgrounded',
          user_id: user?.id,
          resource_accessed: 'application',
          action_performed: 'minimize',
          result: 'success',
          severity: 'low',
          control_category: 'security'
        });
      } else {
        soc2ComplianceService.logAuditEvent({
          event_type: 'session_resumed',
          user_id: user?.id,
          resource_accessed: 'application',
          action_performed: 'focus',
          result: 'success',
          severity: 'low',
          control_category: 'security'
        });
      }
    };

    // Monitor errors
    const handleError = (event: ErrorEvent) => {
      const user = getCurrentUser();
      
      soc2ComplianceService.logSecurityEvent({
        event_category: 'data_integrity',
        event_description: `Application error: ${event.message}`,
        affected_resource: 'web_application',
        user_id: user?.id,
        risk_level: 'medium',
        metadata: {
          error: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    };

    // Monitor unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const user = getCurrentUser();
      
      soc2ComplianceService.logSecurityEvent({
        event_category: 'data_integrity',
        event_description: `Unhandled promise rejection: ${event.reason}`,
        affected_resource: 'web_application',
        user_id: user?.id,
        risk_level: 'medium',
        metadata: {
          reason: event.reason?.toString(),
          stack: event.reason?.stack
        }
      });
    };

    // Set up monitoring
    initializeMonitoring();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Periodic health check
    const healthCheckInterval = setInterval(() => {
      soc2ComplianceService.recordAvailabilityMetric(
        'web_application',
        'up',
        performance.now(),
        100,
        0,
        1,
        { 
          health_check: true,
          memory_usage: (performance as any).memory?.usedJSHeapSize || 0
        }
      );
    }, 60000); // Every minute

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(healthCheckInterval);
      
      // Log session end
      const user = getCurrentUser();
      soc2ComplianceService.logAuditEvent({
        event_type: 'session_end',
        user_id: user?.id,
        resource_accessed: 'application',
        action_performed: 'terminate',
        result: 'success',
        severity: 'low',
        control_category: 'security'
      });
    };
  }, []);

  return <>{children}</>;
};

export default SOC2Monitor;
