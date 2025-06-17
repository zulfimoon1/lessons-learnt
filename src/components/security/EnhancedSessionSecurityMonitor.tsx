
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityStatus {
  level: 'secure' | 'warning' | 'danger';
  message: string;
  details?: string;
}

const EnhancedSessionSecurityMonitor = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 'secure',
    message: 'Security monitoring active'
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let suspiciousActivityCount = 0;

    const startMonitoring = async () => {
      setIsMonitoring(true);
      
      // Monitor session validity every 30 seconds
      intervalId = setInterval(async () => {
        try {
          const isValidSession = await enhancedSecurityService.validateSession();
          
          if (!isValidSession) {
            setSecurityStatus({
              level: 'danger',
              message: 'Session invalid or expired',
              details: 'Please log in again'
            });
            
            await enhancedSecurityService.logSecurityEvent(
              'session_expired',
              'User session expired or became invalid',
              'medium'
            );
            
            return;
          }

          // Check for suspicious activity
          const { data: recentEvents } = await supabase
            .from('audit_log')
            .select('*')
            .eq('table_name', 'security_events_enhanced')
            .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
            .order('timestamp', { ascending: false });

          if (recentEvents && enhancedSecurityService.detectSuspiciousActivity(recentEvents)) {
            suspiciousActivityCount++;
            
            if (suspiciousActivityCount > 2) {
              setSecurityStatus({
                level: 'danger',
                message: 'Suspicious activity detected',
                details: 'Multiple security events in short time'
              });
              
              toast({
                title: "Security Alert",
                description: "Unusual activity detected. Session will be terminated for security.",
                variant: "destructive"
              });
              
              // Force logout on persistent suspicious activity
              await supabase.auth.signOut();
              return;
            }
            
            setSecurityStatus({
              level: 'warning',
              message: 'Elevated security monitoring',
              details: 'Unusual activity patterns detected'
            });
          } else {
            // Reset suspicious activity counter if no issues
            suspiciousActivityCount = 0;
            setSecurityStatus({
              level: 'secure',
              message: 'Security status: Normal'
            });
          }

        } catch (error) {
          console.error('Security monitoring error:', error);
          setSecurityStatus({
            level: 'warning',
            message: 'Security monitoring error',
            details: 'Unable to verify security status'
          });
        }
      }, 30000); // Check every 30 seconds

      // Initial security check
      const isValidSession = await enhancedSecurityService.validateSession();
      if (isValidSession) {
        setSecurityStatus({
          level: 'secure',
          message: 'Security monitoring initialized'
        });
      }
    };

    startMonitoring();

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIsMonitoring(false);
    };
  }, [toast]);

  const getSecurityIcon = () => {
    switch (securityStatus.level) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'danger':
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getAlertVariant = () => {
    switch (securityStatus.level) {
      case 'secure':
        return 'default';
      case 'warning':
        return 'default';
      case 'danger':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (!isMonitoring) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className={`w-80 ${
        securityStatus.level === 'secure' ? 'border-green-200 bg-green-50' :
        securityStatus.level === 'warning' ? 'border-orange-200 bg-orange-50' :
        'border-red-200 bg-red-50'
      }`} variant={getAlertVariant()}>
        {getSecurityIcon()}
        <AlertDescription>
          <div>
            <strong>{securityStatus.message}</strong>
            {securityStatus.details && (
              <div className="text-sm mt-1 opacity-80">
                {securityStatus.details}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnhancedSessionSecurityMonitor;
