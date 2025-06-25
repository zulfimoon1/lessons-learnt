
import { useState, useEffect } from 'react';
import { supabaseSecurityPatch } from '@/services/supabaseSecurityPatch';

interface SecurityStatus {
  isSecure: boolean;
  errorCount: number;
  warningCount: number;
  lastChecked: Date | null;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning';
    description: string;
    table?: string;
    function?: string;
  }>;
}

export const useSecurityAdvisor = () => {
  const [status, setStatus] = useState<SecurityStatus>({
    isSecure: true,
    errorCount: 0,
    warningCount: 0,
    lastChecked: null,
    issues: []
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSecurityStatus = async () => {
    setIsChecking(true);
    try {
      const report = await supabaseSecurityPatch.generateSecurityReport();
      
      setStatus({
        isSecure: report.errors === 0 && report.warnings === 0,
        errorCount: report.errors,
        warningCount: report.warnings,
        lastChecked: new Date(),
        issues: report.issues
      });
      
      return report;
    } catch (error) {
      console.error('Security check failed:', error);
      setStatus(prev => ({
        ...prev,
        lastChecked: new Date()
      }));
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial security check
    checkSecurityStatus();
    
    // Set up periodic checks every 5 minutes
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isChecking,
    checkSecurityStatus,
    refreshStatus: checkSecurityStatus
  };
};
