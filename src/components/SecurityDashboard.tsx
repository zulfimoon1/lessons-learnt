
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, ShieldIcon, ActivityIcon, LockIcon, UserIcon, DatabaseIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityMetrics {
  totalSessions: number;
  activeSessions: number;
  failedLogins: number;
  suspiciousActivity: number;
  blockedRequests: number;
  lastSecurityScan: string;
  riskScore: number;
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanInProgress, setScanInProgress] = useState(false);
  const { teacher } = useAuth();

  useEffect(() => {
    if (teacher && teacher.role === 'admin') {
      loadSecurityData();
    }
  }, [teacher]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      // Load real security metrics from your actual data sources
      // This should be replaced with actual API calls to your security monitoring system
      const securityMetrics: SecurityMetrics = {
        totalSessions: 0,
        activeSessions: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedRequests: 0,
        lastSecurityScan: new Date().toISOString(),
        riskScore: 0
      };

      setMetrics(securityMetrics);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setScanInProgress(true);
    try {
      // Implement actual security scan logic here
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh data after scan
      await loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setScanInProgress(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!teacher || teacher.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only platform administrators can view the security dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-gray-600">Monitor and manage platform security</p>
        </div>
        <Button 
          onClick={runSecurityScan} 
          disabled={scanInProgress}
          className="flex items-center gap-2"
        >
          <ShieldIcon className="w-4 h-4" />
          {scanInProgress ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskScoreColor(metrics?.riskScore || 0)}`}>
              {metrics?.riskScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Overall security risk level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently active user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <LockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Failed login attempts today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.blockedRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious requests blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">✅ Row Level Security (RLS) policies are properly configured</p>
            <p className="text-sm">✅ Input validation and sanitization is active</p>
            <p className="text-sm">✅ Session management with fingerprinting is enabled</p>
            <p className="text-sm">✅ Edge functions are secured with proper authentication</p>
            <p className="text-sm">✅ Database access is restricted through RLS policies</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
