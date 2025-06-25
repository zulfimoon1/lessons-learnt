
import React from 'react';
import SOC2SystemTest from '@/components/soc2/SOC2SystemTest';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';

const SOC2TestPage: React.FC = () => {
  const { logUserAction } = useSOC2Monitoring();

  React.useEffect(() => {
    logUserAction('view', 'soc2_test_page', {
      test_suite: 'system_validation'
    });
  }, [logUserAction]);

  return (
    <div className="min-h-screen bg-background">
      <SOC2SystemTest />
    </div>
  );
};

export default SOC2TestPage;
