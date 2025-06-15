
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { securityValidationService } from '@/services/securityValidationService';
import { enhancedSecureSessionService } from '@/services/enhancedSecureSessionService';

const SessionSecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<{
    isSecure: boolean;
    warnings: string[];
    lastCheck: Date;
  }>({
    isSecure: true,
    warnings: [],
    lastCheck: new Date()
  });

  useEffect(() => {
    const checkSessionSecurity = async () => {
      try {
        const warnings: string[] = [];
        
        // Check session validity
        const sessionValid = securityValidationService.validateSessionSecurity();
        if (!sessionValid) {
          warnings.push('Session security validation failed');
        }

        // Check for suspicious activity
        await enhancedSecureSessionService.detectSuspiciousActivity();

        setSecurityStatus({
          isSecure: warnings.length === 0,
          warnings,
          lastCheck: new Date()
        });
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityStatus({
          isSecure: false,
          warnings: ['Security system error'],
          lastCheck: new Date()
        });
      }
    };

    // Initial check
    checkSessionSecurity();

    // Set up periodic monitoring
    const interval = setInterval(checkSessionSecurity, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  if (securityStatus.warnings.length === 0) {
    return null; // Don't show anything when secure
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-center justify-between">
          <span>Security warnings detected</span>
          <span className="text-xs">
            Last check: {securityStatus.lastCheck.toLocaleTimeString()}
          </span>
        </div>
        {securityStatus.warnings.length > 0 && (
          <ul className="mt-2 text-sm">
            {securityStatus.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SessionSecurityMonitor;
