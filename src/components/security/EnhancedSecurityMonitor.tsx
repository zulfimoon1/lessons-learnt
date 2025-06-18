
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityStatus {
  level: 'secure' | 'warning' | 'critical';
  message: string;
  lastCheck: string;
  activeThreats: number;
  sessionValid: boolean;
}

const EnhancedSecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 'secure',
    message: 'Initializing security check...',
    lastCheck: new Date().toISOString(),
    activeThreats: 0,
    sessionValid: true
  });

  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        // Check session security
        const sessionCheck = await supabase.rpc('validate_session_security', {
          user_agent: navigator.userAgent,
          ip_address: 'client-side'
        });

        // Get recent security events
        const { data: recentEvents } = await supabase
          .from('audit_log')
          .select('*')
          .eq('table_name', 'security_events')
          .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
          .order('timestamp', { ascending: false })
          .limit(50);

        const highRiskEvents = recentEvents?.filter(event => 
          event.new_data?.severity === 'high'
        ).length || 0;

        const mediumRiskEvents = recentEvents?.filter(event => 
          event.new_data?.severity === 'medium'
        ).length || 0;

        let level: 'secure' | 'warning' | 'critical' = 'secure';
        let message = 'All security checks passed';

        if (!sessionCheck.data) {
          level = 'critical';
          message = 'Session security validation failed';
        } else if (highRiskEvents > 3) {
          level = 'critical';
          message = `${highRiskEvents} high-risk security events detected`;
        } else if (highRiskEvents > 0 || mediumRiskEvents > 5) {
          level = 'warning';
          message = `Security alerts detected: ${highRiskEvents} high, ${mediumRiskEvents} medium`;
        }

        setSecurityStatus({
          level,
          message,
          lastCheck: new Date().toISOString(),
          activeThreats: highRiskEvents + mediumRiskEvents,
          sessionValid: sessionCheck.data || false
        });

      } catch (error) {
        console.error('Security status check failed:', error);
        setSecurityStatus(prev => ({
          ...prev,
          level: 'warning',
          message: 'Security check failed - please refresh',
          lastCheck: new Date().toISOString()
        }));
      }
    };

    // Initial check
    checkSecurityStatus();

    // Check every 30 seconds
    const interval = setInterval(checkSecurityStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (securityStatus.level) {
      case 'secure':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (securityStatus.level) {
      case 'secure':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
    }
  };

  const getBadgeVariant = () => {
    switch (securityStatus.level) {
      case 'secure':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
    }
  };

  return (
    <Card className={`${getStatusColor()} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Security Monitor
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={getBadgeVariant()}>
            {securityStatus.level.toUpperCase()}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-700">
          {securityStatus.message}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium">Active Threats:</span>
            <span className={`ml-1 ${securityStatus.activeThreats > 0 ? 'text-red-600 font-medium' : 'text-green-600'}`}>
              {securityStatus.activeThreats}
            </span>
          </div>
          <div>
            <span className="font-medium">Session:</span>
            <span className={`ml-1 ${securityStatus.sessionValid ? 'text-green-600' : 'text-red-600'}`}>
              {securityStatus.sessionValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Last check: {new Date(securityStatus.lastCheck).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSecurityMonitor;
