
import React from 'react';
import HIPAADashboard from '@/components/hipaa/HIPAADashboard';
import SecurityGuard from '@/components/auth/SecurityGuard';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';
import EnhancedLazyLoader from '@/components/performance/EnhancedLazyLoader';
import { useDeviceType } from '@/hooks/use-device';

const HIPAACompliancePage: React.FC = () => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  React.useEffect(() => {
    // Log page access for HIPAA audit trail
    console.log('HIPAA Compliance Dashboard accessed');
  }, []);

  return (
    <SecurityGuard 
      requireAuth={true} 
      userType="admin" 
      redirectTo="/teacher-login"
    >
      <MobileOptimizedLayout className="bg-background">
        <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
          <HIPAADashboard />
        </EnhancedLazyLoader>
      </MobileOptimizedLayout>
    </SecurityGuard>
  );
};

export default HIPAACompliancePage;
