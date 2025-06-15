
import React, { useEffect, useState } from 'react';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';

const SessionSecurityMonitor: React.FC = () => {
  const [securityLevel, setSecurityLevel] = useState<'secure' | 'warning' | 'critical'>('secure');

  useEffect(() => {
    const checkSecurity = () => {
      const isSecure = enhancedSecurityValidationService.validateSessionSecurity();
      const isSuspicious = enhancedSecurityValidationService.detectSuspiciousActivity();
      
      if (!isSecure || isSuspicious) {
        setSecurityLevel('warning');
        enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Security validation failed: secure=${isSecure}, suspicious=${isSuspicious}`,
          severity: 'medium'
        });
      } else {
        setSecurityLevel('secure');
      }
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Only show warnings, don't interfere with UI
  if (securityLevel === 'secure') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
      Security monitoring active
    </div>
  );
};

export default SessionSecurityMonitor;
