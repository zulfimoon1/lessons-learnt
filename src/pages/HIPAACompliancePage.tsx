
import React from 'react';
import HIPAADashboard from '@/components/hipaa/HIPAADashboard';
import SecurityGuard from '@/components/auth/SecurityGuard';

const HIPAACompliancePage: React.FC = () => {
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
      <div className="min-h-screen bg-background">
        <HIPAADashboard />
      </div>
    </SecurityGuard>
  );
};

export default HIPAACompliancePage;
