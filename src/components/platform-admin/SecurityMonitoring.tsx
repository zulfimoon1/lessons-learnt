
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, Activity, Lock, Users } from 'lucide-react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

interface SecurityEvent {
  type: string;
  userId?: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityMonitoring: React.FC = () => {
  const { admin, isAuthenticated } = usePlatformAdmin();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState({ failedLogins: 0, blockedIPs: 0, suspiciousActivity: 0 });
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔒 SecurityMonitoring: Auth check', { 
    admin: !!admin, 
    isAuthenticated, 
    adminEmail: admin?.email 
  });

  // Platform admin access - simplified check
  const hasAccess = admin && isAuthenticated;
  
  console.log('🔒 SecurityMonitoring: Final access decision', { hasAccess });

  const fetchSecurityEvents = () => {
    try {
      // Get events from local storage
      const localEvents = JSON.parse(localStorage.getItem('security_logs') || '[]');
      const last24Hours = localEvents.filter((event: SecurityEvent) => 
        new Date(event.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
      
      setSecurityEvents(last24Hours.slice(-50)); // Last 50 events
      setMetrics(enhancedSecurityService.getSecurityMetrics());
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSecurityLogs = () => {
    localStorage.removeItem('security_logs');
    setSecurityEvents([]);
    setMetrics({ failedLogins: 0, blockedIPs: 0, suspiciousActivity: 0 });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Eye className="w-4 h-4" />;
      case 'low': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    console.log('🔒 SecurityMonitoring: useEffect triggered, hasAccess:', hasAccess);
    if (hasAccess) {
      fetchSecurityEvents();
      
      // Set up periodic refresh
      const interval = setInterval(fetchSecurityEvents, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [hasAccess]);

  if (!hasAccess) {
    console.log('🔒 SecurityMonitoring: Access denied - showing error');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Security Dashboard - Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Only platform administrators can access the security monitoring dashboard.</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-mono">Debug Info:</p>
            <p className="text-sm text-gray-500">Admin authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-500">Admin object present: {admin ? 'Yes' : 'No'}</p>
            {admin && (
              <>
                <p className="text-sm text-gray-500">Admin email: {admin.email}</p>
                <p className="text-sm text-gray-500">Admin role: {admin.role}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins (24h)</p>
                <p className="text-2xl font-bold">{metrics.failedLogins}</p>
              </div>
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold">{metrics.blockedIPs}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold">{metrics.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Security Events (Last 24 Hours)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={fetchSecurityEvents} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={clearSecurityLogs} variant="outline" size="sm">
                Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No security events recorded in the last 24 hours</p>
                <p className="text-xs text-muted-foreground mt-2">This is a good sign - your system appears secure!</p>
              </div>
            ) : (
              securityEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(event.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{event.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">{event.details}</p>
                    {event.userId && (
                      <p className="text-xs text-muted-foreground mt-1">User ID: {event.userId}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Regular Security Monitoring</p>
                <p className="text-sm text-blue-700">Review security events daily and investigate any suspicious activity patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Lock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Strong Password Policies</p>
                <p className="text-sm text-green-700">Encourage users to use strong, unique passwords and consider implementing password rotation.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Rate Limiting Active</p>
                <p className="text-sm text-yellow-700">The system automatically blocks suspicious login attempts. Monitor for repeated blocks from the same sources.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
