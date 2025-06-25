
import React from 'react';
import SOC2Dashboard from '@/components/soc2/SOC2Dashboard';
import SecurityGuard from '@/components/auth/SecurityGuard';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';

const SOC2CompliancePage: React.FC = () => {
  const { logUserAction } = useSOC2Monitoring();

  React.useEffect(() => {
    logUserAction('view', 'soc2_compliance_dashboard', {
      dashboard_type: 'admin_compliance'
    });
  }, [logUserAction]);

  return (
    <SecurityGuard 
      requireAuth={true} 
      userType="admin" 
      redirectTo="/teacher-login"
    >
      <div className="min-h-screen bg-background">
        <SOC2Dashboard />
      </div>
    </SecurityGuard>
  );
};

export default SOC2CompliancePage;
