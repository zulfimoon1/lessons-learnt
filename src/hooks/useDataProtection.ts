
import { useState, useEffect } from 'react';
import { dataProtectionService } from '@/services/security/dataProtectionService';
import { soc2ComplianceService } from '@/services/soc2ComplianceService';

interface DataProtectionState {
  encryptionAtRest: any[];
  encryptionInTransit: any[];
  dataClassifications: any[];
  dlpAlerts: any[];
  encryptionCompliance: any;
  backupStatus: any;
  isLoading: boolean;
}

export const useDataProtection = () => {
  const [protectionState, setProtectionState] = useState<DataProtectionState>({
    encryptionAtRest: [],
    encryptionInTransit: [],
    dataClassifications: [],
    dlpAlerts: [],
    encryptionCompliance: null,
    backupStatus: null,
    isLoading: true
  });

  useEffect(() => {
    const loadDataProtectionInfo = () => {
      try {
        const encryptionAtRest = dataProtectionService.validateEncryptionAtRest();
        const encryptionInTransit = dataProtectionService.validateEncryptionInTransit();
        const dataClassifications = dataProtectionService.getDataClassifications();
        const dlpAlerts = dataProtectionService.getDLPAlerts();
        const encryptionCompliance = dataProtectionService.getEncryptionCompliance();
        const backupStatus = dataProtectionService.performBackupIntegrityCheck();

        setProtectionState({
          encryptionAtRest,
          encryptionInTransit,
          dataClassifications,
          dlpAlerts,
          encryptionCompliance,
          backupStatus,
          isLoading: false
        });

        // Log compliance check
        soc2ComplianceService.logAuditEvent({
          event_type: 'data_protection_check',
          resource_accessed: 'encryption_validation',
          action_performed: 'compliance_check',
          result: 'success',
          timestamp: new Date().toISOString(),
          severity: 'low',
          control_category: 'confidentiality',
          details: {
            encryptionCompliance: encryptionCompliance.compliancePercentage,
            dlpAlertsCount: dlpAlerts.length
          }
        });

      } catch (error) {
        console.error('Failed to load data protection info:', error);
        setProtectionState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadDataProtectionInfo();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDataProtectionInfo, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const monitorDataAccess = (table: string, operation: string, recordCount?: number) => {
    const alert = dataProtectionService.monitorDataAccess(table, operation, recordCount);
    if (alert) {
      dataProtectionService.logDLPAlert(alert);
      
      // Refresh alerts
      const updatedAlerts = dataProtectionService.getDLPAlerts();
      setProtectionState(prev => ({
        ...prev,
        dlpAlerts: updatedAlerts
      }));

      // Log security event for high-severity alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        soc2ComplianceService.logSecurityEvent({
          event_category: 'data_integrity',
          event_description: alert.description,
          affected_resource: alert.table,
          user_id: alert.userId,
          risk_level: alert.severity,
          metadata: { recordCount: alert.recordCount }
        });
      }
    }
  };

  return {
    ...protectionState,
    monitorDataAccess
  };
};
