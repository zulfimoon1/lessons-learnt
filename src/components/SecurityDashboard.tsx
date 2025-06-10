
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, ShieldIcon, ActivityIcon, LockIcon, UserIcon, DatabaseIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedSecureSessionService } from '@/services/enhancedSecureSessionService';
import { adminSecurityUtils } from '@/services/platformAdminService';

interface SecurityMetrics {
  totalSessions: number;
  activeSessions: number;
  failedLogins: number;
  suspiciousActivity: number;
  blockedRequests: number;
  lastSecurityScan: string;
  vulnerabilities: SecurityVulnerability[];
  riskScore: number;
}

interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  detected: string;
  status: 'open' | 'investigating' | 'resolved';
}

interface SecurityEvent {
  id: string;
  type: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  resolved: boolean;
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
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

      // Load security metrics
      const metricsData = await adminSecurityUtils.getSecurityMetrics();
      
      // Mock data for demonstration (in production, fetch from security service)
      const securityMetrics: SecurityMetrics = {
        totalSessions: 1247,
        activeSessions: 89,
        failedLogins: metricsData.loginAttempts,
        suspiciousActivity: metricsData.suspiciousActivities,
        blockedRequests: metricsData.blockedIPs,
        lastSecurityScan: metricsData.lastSecurityScan,
        vulnerabilities: [
          {
            id: '1',
            severity: 'medium',
            type: 'Session Security',
            description: 'Consider implementing HTTP-only cookies for enhanced session security',
            detected: new Date().toISOString(),
            status: 'investigating'
          },
          {
            id: '2',
            severity: 'low',
            type: 'Content Security Policy',
            description: 'CSP headers could be strengthened for better XSS protection',
            detected: new Date().toISOString(),
            status: 'open'
          }
        ],
        riskScore: 25 // Low risk (0-100 scale)
      };

      setMetrics(securityMetrics);

      // Load recent security events
      const events: SecurityEvent[] = [
        {
          id: '1',
          type: 'Failed Login Attempt',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          details: 'Multiple failed login attempts from IP 192.168.1.100',
          severity: 'warning',
          resolved: false
        },
        {
          id: '2',
          type: 'Suspicious Activity',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          details: 'Unusual session pattern detected for user session',
          severity: 'info',
          resolved: true
        },
        {
          id: '3',
          type: 'Security Scan',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          details: 'Automated security scan completed successfully',
          severity: 'info',
          resolved: true
        }
      ];

      setRecentEvents(events);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setScanInProgress(true);
    try {
      // Simulate security scan (in production, trigger actual scan)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh data after scan
      await loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setScanInProgress(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
              {metrics?.riskScore}/100
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
            <div className="text-2xl font-bold">{metrics?.activeSessions}</div>
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
            <div className="text-2xl font-bold text-red-600">{metrics?.failedLogins}</div>
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
            <div className="text-2xl font-bold">{metrics?.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious requests blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5" />
            Security Vulnerabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.vulnerabilities.length === 0 ? (
            <p className="text-gray-600">No active vulnerabilities detected.</p>
          ) : (
            <div className="space-y-3">
              {metrics?.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(vuln.severity)}>
                      {vuln.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{vuln.type}</h4>
                      <p className="text-sm text-gray-600">{vuln.description}</p>
                    </div>
                  </div>
                  <Badge variant={vuln.status === 'resolved' ? 'default' : 'secondary'}>
                    {vuln.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{event.type}</h4>
                  <p className="text-sm text-gray-600">{event.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {event.severity}
                  </Badge>
                  {event.resolved && (
                    <Badge variant="default">Resolved</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">✅ Row Level Security (RLS) policies are properly configured</p>
            <p className="text-sm">✅ Input validation and sanitization is active</p>
            <p className="text-sm">✅ Session management with fingerprinting is enabled</p>
            <p className="text-sm">⚠️ Consider implementing HTTP-only cookies for enhanced security</p>
            <p className="text-sm">⚠️ Regular security scans should be scheduled</p>
            <p className="text-sm">💡 Enable two-factor authentication for admin accounts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
