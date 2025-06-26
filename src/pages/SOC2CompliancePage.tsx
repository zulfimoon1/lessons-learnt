
import React from 'react';
import SOC2Dashboard from '@/components/soc2/SOC2Dashboard';
import SecurityGuard from '@/components/auth/SecurityGuard';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';
import EnhancedLazyLoader from '@/components/performance/EnhancedLazyLoader';
import { useDeviceType } from '@/hooks/use-device';

const SOC2CompliancePage: React.FC = () => {
  const { logUserAction } = useSOC2Monitoring();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

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
      <MobileOptimizedLayout className="bg-background">
        <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
          <SOC2Dashboard />
        </EnhancedLazyLoader>
      </MobileOptimizedLayout>
    </SecurityGuard>
  );
};

export default SOC2CompliancePage;
