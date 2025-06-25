
import { useState, useEffect } from 'react';
import { changeControlService } from '@/services/soc2/changeControlService';
import { soc2ComplianceService } from '@/services/soc2ComplianceService';

interface ChangeControlState {
  changes: any[];
  complianceReport: any;
  isLoading: boolean;
}

export const useChangeControl = () => {
  const [controlState, setControlState] = useState<ChangeControlState>({
    changes: [],
    complianceReport: null,
    isLoading: true
  });

  useEffect(() => {
    const loadChangeControlData = () => {
      try {
        const changes = changeControlService.getChangeHistory(50);
        const complianceReport = changeControlService.getComplianceReport();

        setControlState({
          changes,
          complianceReport,
          isLoading: false
        });

        // Log compliance check
        soc2ComplianceService.logAuditEvent({
          event_type: 'change_control_review',
          resource_accessed: 'change_history',
          action_performed: 'compliance_check',
          result: 'success',
          timestamp: new Date().toISOString(),
          severity: 'low',
          control_category: 'availability',
          details: {
            totalChanges: changes.length,
            complianceScore: complianceReport.complianceScore,
            pendingApprovals: complianceReport.pendingApprovals
          }
        });

        // Monitor system changes
        changeControlService.monitorSystemChanges();

      } catch (error) {
        console.error('Failed to load change control data:', error);
        setControlState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadChangeControlData();
    
    // Refresh every 2 minutes
    const interval = setInterval(loadChangeControlData, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const logChange = (
    changeType: 'configuration' | 'deployment' | 'security_update' | 'user_access' | 'system_setting',
    description: string,
    affectedSystem: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ) => {
    const changeId = changeControlService.logChange({
      changeType,
      description,
      changedBy: 'current_user',
      affectedSystem,
      approvalStatus: riskLevel === 'critical' ? 'pending' : 'approved',
      riskLevel,
      businessJustification: 'User-initiated change',
      testingCompleted: false,
      metadata: metadata || {}
    });

    // Refresh data
    const changes = changeControlService.getChangeHistory(50);
    const complianceReport = changeControlService.getComplianceReport();
    
    setControlState(prev => ({
      ...prev,
      changes,
      complianceReport
    }));

    return changeId;
  };

  const approveChange = (changeId: string, decision: 'approved' | 'rejected', comments?: string) => {
    changeControlService.approveChange(changeId, 'current_user', decision, comments);
    
    // Refresh data
    const changes = changeControlService.getChangeHistory(50);
    const complianceReport = changeControlService.getComplianceReport();
    
    setControlState(prev => ({
      ...prev,
      changes,
      complianceReport
    }));

    // Log security event for change approvals
    soc2ComplianceService.logSecurityEvent({
      event_category: 'access_control',
      event_description: `Change ${changeId} ${decision}`,
      affected_resource: 'change_control',
      risk_level: decision === 'approved' ? 'low' : 'medium',
      metadata: { changeId, decision, comments }
    });
  };

  return {
    ...controlState,
    logChange,
    approveChange
  };
};
