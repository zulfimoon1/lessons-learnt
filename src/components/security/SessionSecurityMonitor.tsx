
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { useAuth } from '@/contexts/AuthContext';

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

  const { teacher, student } = useAuth();

  useEffect(() => {
    const checkSessionSecurity = async () => {
      try {
        const warnings: string[] = [];
        
        // Enhanced session validation
        const sessionValid = enhancedSecurityValidationService.validateSessionSecurity();
        if (!sessionValid) {
          warnings.push('Session security validation failed');
        }

        // Check rate limiting status
        const userId = teacher?.id || student?.id;
        if (userId) {
          const rateLimitKey = `session_check_${userId}`;
          if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 30, 300000)) {
            warnings.push('Session check rate limit exceeded');
          }
        }

        setSecurityStatus({
          isSecure: warnings.length === 0,
          warnings,
          lastCheck: new Date()
        });

        // Log any security issues
        if (warnings.length > 0) {
          await enhancedSecurityValidationService.logSecurityEvent({
            type: 'suspicious_activity',
            userId: teacher?.id || student?.id,
            details: `Session security warnings: ${warnings.join(', ')}`,
            severity: 'medium'
          });
        }

      } catch (error) {
        console.error('Session security check failed:', error);
        setSecurityStatus({
          isSecure: false,
          warnings: ['Session security system error'],
          lastCheck: new Date()
        });
      }
    };

    // Initial check
    checkSessionSecurity();

    // Set up periodic monitoring (every 2 minutes)
    const interval = setInterval(checkSessionSecurity, 120000);

    return () => clearInterval(interval);
  }, [teacher, student]);

  if (securityStatus.warnings.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-center justify-between">
          <span>Session security warnings detected</span>
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
