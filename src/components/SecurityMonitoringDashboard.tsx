import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Activity, Users, Database, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSecurityAuditLog, clearSecurityAuditLog } from './SecurityAuditLogger';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  suspiciousActivities: number;
  rateLimitViolations: number;
  csrfViolations: number;
  recentEvents: any[];
}

const SecurityMonitoringDashboard: React.FC = () => {
  const { teacher } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    suspiciousActivities: 0,
    rateLimitViolations: 0,
    csrfViolations: 0,
    recentEvents: []
  });

  // Only show to admin users
  if (!teacher || teacher.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Security Dashboard - Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Only administrators can access the security monitoring dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const events = getSecurityAuditLog();
        
        const criticalTypes = ['unauthorized_access', 'suspicious_activity', 'csrf_violation'];
        const criticalEvents = events.filter((e: any) => criticalTypes.includes(e.type));
        const suspiciousActivities = events.filter((e: any) => e.type === 'suspicious_activity');
        const rateLimitViolations = events.filter((e: any) => e.type === 'rate_limit_exceeded');
        const csrfViolations = events.filter((e: any) => e.type === 'csrf_violation');
        
        setMetrics({
          totalEvents: events.length,
          criticalEvents: criticalEvents.length,
          suspiciousActivities: suspiciousActivities.length,
          rateLimitViolations: rateLimitViolations.length,
          csrfViolations: csrfViolations.length,
          recentEvents: events.slice(-10).reverse()
        });
      } catch (error) {
        console.error('Failed to load security metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const clearSecurityLogs = () => {
    clearSecurityAuditLog();
    setMetrics({
      totalEvents: 0,
      criticalEvents: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      recentEvents: []
    });
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'unauthorized_access':
      case 'csrf_violation':
        return 'destructive';
      case 'suspicious_activity':
      case 'rate_limit_exceeded':
        return 'secondary';
      case 'login_failed':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Security Monitoring Dashboard
          </h1>
          <p className="text-gray-600">Real-time security monitoring and threat detection</p>
        </div>
        <Button variant="outline" onClick={clearSecurityLogs}>
          Clear Logs
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Potential threats detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
            <Lock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">Blocked attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Latest security events and alerts from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No security events recorded</p>
            ) : (
              metrics.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityColor(event.type)}>
                      {event.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.details}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {event.userId && (
                    <Badge variant="outline">
                      User: {event.userId.substring(0, 8)}...
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoringDashboard;
