
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { securityMonitoringService } from '@/services/securityMonitoringService';

interface SecurityMonitoringState {
  isActive: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  alerts: string[];
  lastCheck: Date;
  metrics: {
    recentAttempts: number;
    blockedIPs: string[];
    suspiciousPatterns: string[];
  };
}

export const useSecurityMonitoring = () => {
  const { teacher, student } = useAuth();
  const [monitoringState, setMonitoringState] = useState<SecurityMonitoringState>({
    isActive: false,
    threatLevel: 'low',
    alerts: [],
    lastCheck: new Date(),
    metrics: {
      recentAttempts: 0,
      blockedIPs: [],
      suspiciousPatterns: []
    }
  });

  useEffect(() => {
    const startSecurityMonitoring = async () => {
      try {
        setMonitoringState(prev => ({ ...prev, isActive: true }));

        // Get initial security metrics
        const metrics = await securityMonitoringService.getSecurityMetrics();
        
        setMonitoringState(prev => ({
          ...prev,
          metrics,
          lastCheck: new Date()
        }));

        // Log monitoring start
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'session_error',
          userId: teacher?.id || student?.id,
          details: 'Security monitoring initialized',
          severity: 'low'
        });

      } catch (error) {
        console.error('Failed to start security monitoring:', error);
        setMonitoringState(prev => ({
          ...prev,
          isActive: false,
          alerts: ['Security monitoring initialization failed']
        }));
      }
    };

    if (teacher || student) {
      startSecurityMonitoring();

      // Set up periodic monitoring
      const interval = setInterval(async () => {
        try {
          const metrics = await securityMonitoringService.getSecurityMetrics();
          const sessionValid = enhancedSecurityValidationService.validateSessionSecurity();
          
          let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          const alerts: string[] = [];

          if (!sessionValid) {
            threatLevel = 'high';
            alerts.push('Session security validation failed');
          }

          if (metrics.recentAttempts > 10) {
            threatLevel = 'medium';
            alerts.push(`High login activity detected: ${metrics.recentAttempts} attempts`);
          }

          setMonitoringState(prev => ({
            ...prev,
            threatLevel,
            alerts,
            metrics,
            lastCheck: new Date()
          }));

        } catch (error) {
          console.error('Security monitoring check failed:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [teacher, student]);

  const logSecurityEvent = async (
    type: string,
    details: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    await enhancedSecurityValidationService.logSecurityEvent({
      type: 'suspicious_activity',
      userId: teacher?.id || student?.id,
      details,
      severity
    });
  };

  const acknowledgeAlert = (alertIndex: number) => {
    setMonitoringState(prev => ({
      ...prev,
      alerts: prev.alerts.filter((_, index) => index !== alertIndex)
    }));
  };

  return {
    ...monitoringState,
    logSecurityEvent,
    acknowledgeAlert
  };
};
