
import React, { useEffect, useState } from 'react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShieldIcon, AlertTriangleIcon } from 'lucide-react';

interface SecurityStatus {
  level: 'secure' | 'warning' | 'critical';
  message: string;
  violations: number;
}

const EnhancedSecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 'secure',
    message: 'Security monitoring active',
    violations: 0
  });

  useEffect(() => {
    const initializeSecurityMonitoring = async () => {
      // Start security monitoring
      enhancedSecurityService.monitorSecurityViolations();
      enhancedSecurityService.enhanceFormValidation();

      // Check initial security status
      await checkSecurityStatus();

      // Set up periodic security checks
      const securityCheckInterval = setInterval(checkSecurityStatus, 30000); // Every 30 seconds

      return () => {
        clearInterval(securityCheckInterval);
      };
    };

    const checkSecurityStatus = async () => {
      try {
        const dashboardData = await enhancedSecurityService.getSecurityDashboardData();
        
        let level: 'secure' | 'warning' | 'critical' = 'secure';
        let message = 'Security monitoring active';

        if (dashboardData.recentViolations > 5) {
          level = 'critical';
          message = `High security activity detected (${dashboardData.recentViolations} recent violations)`;
        } else if (dashboardData.recentViolations > 0) {
          level = 'warning';
          message = `Security monitoring active (${dashboardData.recentViolations} recent violations)`;
        }

        setSecurityStatus({
          level,
          message,
          violations: dashboardData.recentViolations
        });

        // Log security check
        if (level !== 'secure') {
          enhancedSecurityService.logSecurityViolation({
            type: 'security_status_check',
            details: `Security status: ${level}, Recent violations: ${dashboardData.recentViolations}`,
            severity: level === 'critical' ? 'high' : 'medium'
          });
        }
      } catch (error) {
        console.error('Security status check failed:', error);
        setSecurityStatus({
          level: 'warning',
          message: 'Security monitoring degraded',
          violations: 0
        });
      }
    };

    initializeSecurityMonitoring();
  }, []);

  // Only show status for warning or critical levels
  if (securityStatus.level === 'secure') {
    return null;
  }

  const getStatusConfig = () => {
    switch (securityStatus.level) {
      case 'critical':
        return {
          icon: AlertTriangleIcon,
          variant: 'destructive' as const,
          badgeVariant: 'destructive' as const,
          color: 'text-red-600'
        };
      case 'warning':
        return {
          icon: ShieldIcon,
          variant: 'default' as const,
          badgeVariant: 'secondary' as const,
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: ShieldIcon,
          variant: 'default' as const,
          badgeVariant: 'secondary' as const,
          color: 'text-green-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant={config.variant} className="border-2">
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>{securityStatus.message}</span>
            {securityStatus.violations > 0 && (
              <Badge variant={config.badgeVariant} className="text-xs">
                {securityStatus.violations}
              </Badge>
            )}
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnhancedSecurityMonitor;
