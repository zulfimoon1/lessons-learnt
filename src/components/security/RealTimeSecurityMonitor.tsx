
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const RealTimeSecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<{
    isSecure: boolean;
    warnings: string[];
    lastCheck: Date;
    criticalAlerts: number;
  }>({
    isSecure: true,
    warnings: [],
    lastCheck: new Date(),
    criticalAlerts: 0
  });

  const { teacher, student } = useAuth();

  useEffect(() => {
    const checkRealTimeSecurity = async () => {
      try {
        const warnings: string[] = [];
        let criticalAlerts = 0;

        // Enhanced session validation
        const sessionValid = enhancedSecurityValidationService.validateSessionSecurity();
        if (!sessionValid) {
          warnings.push('Session security validation failed');
          criticalAlerts++;
        }

        // Check for suspicious database activity (only for authenticated users)
        if (teacher || student) {
          try {
            // Monitor for unusual access patterns
            const { data: recentEvents } = await supabase
              .from('audit_log')
              .select('*')
              .eq('table_name', 'security_events')
              .gte('timestamp', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
              .order('timestamp', { ascending: false })
              .limit(10);

            if (recentEvents) {
              const highSeverityEvents = recentEvents.filter(event => 
                event.new_data?.severity === 'high'
              );
              
              if (highSeverityEvents.length > 0) {
                warnings.push(`${highSeverityEvents.length} high-severity security events detected`);
                criticalAlerts += highSeverityEvents.length;
              }
            }
          } catch (error) {
            // Silently handle database access errors
            console.debug('Security monitoring query failed:', error);
          }
        }

        // Check for rate limiting issues
        const rateLimitCheck = enhancedSecurityValidationService.checkRateLimit('security_monitor', 10, 300000);
        if (!rateLimitCheck) {
          warnings.push('Security monitoring rate limit exceeded');
        }

        setSecurityStatus({
          isSecure: warnings.length === 0,
          warnings,
          lastCheck: new Date(),
          criticalAlerts
        });

        // Log monitoring activity
        if (criticalAlerts > 0) {
          await enhancedSecurityValidationService.logSecurityEvent({
            type: 'suspicious_activity',
            userId: teacher?.id || student?.id,
            details: `Real-time security monitor detected ${criticalAlerts} critical alerts`,
            severity: 'medium'
          });
        }

      } catch (error) {
        console.error('Security monitoring failed:', error);
        setSecurityStatus({
          isSecure: false,
          warnings: ['Security monitoring system error'],
          lastCheck: new Date(),
          criticalAlerts: 1
        });
      }
    };

    // Initial check
    checkRealTimeSecurity();

    // Set up periodic monitoring (every 30 seconds)
    const interval = setInterval(checkRealTimeSecurity, 30000);

    return () => clearInterval(interval);
  }, [teacher, student]);

  // Only show alerts when there are warnings
  if (securityStatus.warnings.length === 0) {
    return null;
  }

  const alertVariant = securityStatus.criticalAlerts > 0 ? 'destructive' : 'default';
  const IconComponent = securityStatus.criticalAlerts > 0 ? AlertTriangle : Shield;
  const iconColor = securityStatus.criticalAlerts > 0 ? 'text-red-600' : 'text-yellow-600';

  return (
    <Alert className={`mb-4 ${securityStatus.criticalAlerts > 0 ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <IconComponent className={`h-4 w-4 ${iconColor}`} />
      <AlertDescription className={securityStatus.criticalAlerts > 0 ? 'text-red-800' : 'text-yellow-800'}>
        <div className="flex items-center justify-between">
          <span>
            {securityStatus.criticalAlerts > 0 ? 'Critical security alerts detected' : 'Security warnings detected'}
          </span>
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
        {securityStatus.criticalAlerts > 0 && (
          <div className="mt-2 text-xs">
            Please contact your system administrator if this issue persists.
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default RealTimeSecurityMonitor;
