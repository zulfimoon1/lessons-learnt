
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityMetricsCards from "@/components/security/SecurityMetricsCards";
import SecurityEventsLog from "@/components/security/SecurityEventsLog";
import SecurityStatusPanel from "@/components/security/SecurityStatusPanel";

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
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        
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
    localStorage.removeItem('security_events');
    setMetrics({
      totalEvents: 0,
      criticalEvents: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      recentEvents: []
    });
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

      <SecurityMetricsCards
        totalEvents={metrics.totalEvents}
        criticalEvents={metrics.criticalEvents}
        suspiciousActivities={metrics.suspiciousActivities}
        rateLimitViolations={metrics.rateLimitViolations}
      />

      <SecurityEventsLog recentEvents={metrics.recentEvents} />

      <SecurityStatusPanel />
    </div>
  );
};

export default SecurityMonitoringDashboard;
