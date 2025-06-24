
import { useEffect } from 'react';
import { logCoreSystemStatus } from '@/utils/coreSystemsChecker';

// Hook to monitor and preserve core system functionality
export const useSystemPreservation = () => {
  useEffect(() => {
    // Check core systems on mount
    logCoreSystemStatus();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(() => {
      logCoreSystemStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  return {
    logSystemStatus: logCoreSystemStatus
  };
};
