
import React, { useEffect, useState } from 'react';
import { secureSessionService } from '@/services/secureSessionService';
import { secureDataAccessService } from '@/services/secureDataAccessService';

interface SecurityStatus {
  level: 'secure' | 'warning' | 'critical';
  message?: string;
  timeRemaining?: number;
}

const SessionSecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({ level: 'secure' });

  useEffect(() => {
    const checkSecurity = () => {
      const session = secureSessionService.getSecureSession();
      
      if (!session) {
        setSecurityStatus({ level: 'secure' });
        return;
      }

      const timeRemaining = session.expiresAt - Date.now();
      const minutesRemaining = Math.floor(timeRemaining / 60000);

      // Warning for sessions expiring in 5 minutes
      if (minutesRemaining <= 5 && minutesRemaining > 0) {
        setSecurityStatus({
          level: 'warning',
          message: `Session expires in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`,
          timeRemaining: minutesRemaining
        });
      } else if (timeRemaining <= 0) {
        setSecurityStatus({
          level: 'critical',
          message: 'Session expired - please login again'
        });
        secureSessionService.clearSession();
      } else {
        setSecurityStatus({ level: 'secure' });
      }
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Only show warnings and critical alerts
  if (securityStatus.level === 'secure') {
    return null;
  }

  const getStatusColor = () => {
    switch (securityStatus.level) {
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'critical': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  const handleRefreshSession = () => {
    if (secureSessionService.refreshSession()) {
      setSecurityStatus({ level: 'secure' });
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded border text-sm max-w-xs ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <span>{securityStatus.message}</span>
        {securityStatus.level === 'warning' && (
          <button
            onClick={handleRefreshSession}
            className="ml-2 px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 transition-colors"
          >
            Extend
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionSecurityMonitor;
