
import { useState, useEffect } from 'react';
import { systemMonitoringService } from '@/services/monitoring/systemMonitoringService';
import { soc2ComplianceService } from '@/services/soc2ComplianceService';

interface SystemMonitoringState {
  metrics: any;
  alerts: any[];
  availabilityReport: any;
  isLoading: boolean;
}

export const useSystemMonitoring = () => {
  const [monitoringState, setMonitoringState] = useState<SystemMonitoringState>({
    metrics: null,
    alerts: [],
    availabilityReport: null,
    isLoading: true
  });

  useEffect(() => {
    const loadMonitoringData = () => {
      try {
        const metrics = systemMonitoringService.getSystemMetrics();
        const alerts = systemMonitoringService.getPerformanceAlerts();
        const availabilityReport = systemMonitoringService.getAvailabilityReport();

        // Check for threshold violations
        const newAlerts = systemMonitoringService.checkThresholds(metrics);
        newAlerts.forEach(alert => {
          systemMonitoringService.logPerformanceAlert(alert);
          
          // Log critical alerts as security events
          if (alert.severity === 'critical') {
            soc2ComplianceService.logSecurityEvent({
              event_category: 'data_integrity',
              event_description: alert.message,
              affected_resource: 'system_availability',
              risk_level: 'high',
              metadata: {
                alertType: alert.type,
                threshold: alert.threshold,
                currentValue: alert.currentValue
              }
            });
          }
        });

        setMonitoringState({
          metrics,
          alerts: alerts.length > 0 ? alerts : newAlerts,
          availabilityReport,
          isLoading: false
        });

        // Log monitoring check
        soc2ComplianceService.logAuditEvent({
          event_type: 'system_monitoring',
          resource_accessed: 'availability_metrics',
          action_performed: 'metrics_check',
          result: 'success',
          timestamp: new Date().toISOString(),
          severity: 'low',
          control_category: 'data_integrity',
          details: {
            availability: metrics.availability,
            responseTime: metrics.responseTime,
            errorRate: metrics.errorRate
          }
        });

      } catch (error) {
        console.error('Failed to load monitoring data:', error);
        setMonitoringState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadMonitoringData();
    
    // Refresh every 2 minutes
    const interval = setInterval(loadMonitoringData, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return monitoringState;
};
