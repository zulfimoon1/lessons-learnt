
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { soc2ComplianceService } from '@/services/soc2ComplianceService';
import { getCurrentUser } from '@/services/authService';

export const useSOC2Monitoring = () => {
  const location = useLocation();
  const user = getCurrentUser();

  useEffect(() => {
    // Log page access
    soc2ComplianceService.monitorPageAccess(location.pathname, user?.id);
  }, [location.pathname, user?.id]);

  const logUserAction = (action: string, resource: string, details?: Record<string, any>) => {
    soc2ComplianceService.logAuditEvent({
      event_type: 'user_action',
      user_id: user?.id,
      resource_accessed: resource,
      action_performed: action,
      result: 'success',
      timestamp: new Date().toISOString(),
      severity: 'low',
      control_category: 'security',
      details: {
        page: location.pathname,
        ...details
      }
    });
  };

  const logDataAccess = (tableName: string, operation: string, recordCount?: number) => {
    soc2ComplianceService.monitorDataAccess(tableName, operation, recordCount, user?.id);
  };

  const logSecurityEvent = (
    category: 'access_control' | 'authentication' | 'authorization' | 'data_integrity',
    description: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ) => {
    soc2ComplianceService.logSecurityEvent({
      event_category: category,
      event_description: description,
      affected_resource: location.pathname,
      user_id: user?.id,
      risk_level: riskLevel,
      metadata: {
        page: location.pathname,
        ...metadata
      }
    });
  };

  return {
    logUserAction,
    logDataAccess,
    logSecurityEvent
  };
};
