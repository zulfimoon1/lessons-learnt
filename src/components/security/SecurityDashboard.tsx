
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { ShieldCheckIcon, AlertTriangleIcon, ActivityIcon, TrendingUpIcon } from 'lucide-react';

interface SecurityDashboardData {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  recentViolations: number;
}

const SecurityDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData>({
    totalEvents: 0,
    highSeverityEvents: 0,
    mediumSeverityEvents: 0,
    lowSeverityEvents: 0,
    recentViolations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await enhancedSecurityService.getSecurityDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load security dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Refresh data every minute
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityLevel = () => {
    if (dashboardData.highSeverityEvents > 0 || dashboardData.recentViolations > 5) {
      return { level: 'critical', color: 'text-red-600', bgColor: 'bg-red-50', label: 'Critical' };
    }
    if (dashboardData.mediumSeverityEvents > 0 || dashboardData.recentViolations > 0) {
      return { level: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Warning' };
    }
    return { level: 'secure', color: 'text-green-600', bgColor: 'bg-green-50', label: 'Secure' };
  };

  const securityLevel = getSecurityLevel();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Alert */}
      {securityLevel.level !== 'secure' && (
        <Alert variant={securityLevel.level === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {securityLevel.level === 'critical' 
              ? 'Critical security issues detected. Immediate attention required.' 
              : 'Security violations detected. Please review recent activity.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={securityLevel.level === 'secure' ? 'default' : 'destructive'}
                className={securityLevel.bgColor}
              >
                {securityLevel.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.highSeverityEvents}</div>
            <p className="text-xs text-muted-foreground">Critical security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.recentViolations}</div>
            <p className="text-xs text-muted-foreground">Last hour violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events Breakdown</CardTitle>
          <CardDescription>Overview of security events by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">High Severity</span>
              </div>
              <div className="text-sm font-medium">{dashboardData.highSeverityEvents}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Medium Severity</span>
              </div>
              <div className="text-sm font-medium">{dashboardData.mediumSeverityEvents}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Low Severity</span>
              </div>
              <div className="text-sm font-medium">{dashboardData.lowSeverityEvents}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
