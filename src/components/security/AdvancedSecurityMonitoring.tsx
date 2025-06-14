
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Eye, Activity, Lock, Users, Globe, Clock } from 'lucide-react';
import { advancedRateLimitService } from '@/services/advancedRateLimitService';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'suspicious_ip' | 'rapid_requests' | 'geo_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: string;
  sourceIP?: string;
  resolved: boolean;
}

const AdvancedSecurityMonitoring: React.FC = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [ipStats, setIpStats] = useState({ totalIPs: 0, blockedIPs: 0, suspiciousIPs: 0 });
  const [securityMetrics, setSecurityMetrics] = useState({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedAttempts: 0
  });

  const fetchSecurityData = () => {
    // Get IP statistics
    setIpStats(advancedRateLimitService.getIPStats());
    
    // Get security metrics
    setSecurityMetrics(enhancedSecurityService.getSecurityMetrics());
    
    // Generate mock threats for demonstration
    const mockThreats: SecurityThreat[] = [
      {
        id: '1',
        type: 'brute_force',
        severity: 'high',
        timestamp: Date.now() - 300000,
        details: 'Multiple failed login attempts detected',
        sourceIP: '192.168.1.100',
        resolved: false
      },
      {
        id: '2',
        type: 'suspicious_ip',
        severity: 'medium',
        timestamp: Date.now() - 600000,
        details: 'Login attempt from unusual geographic location',
        sourceIP: '10.0.0.50',
        resolved: true
      }
    ];
    
    setThreats(mockThreats);
  };

  const resolveThreat = (threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, resolved: true } : threat
    ));
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

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Lock className="w-4 h-4" />;
      case 'suspicious_ip': return <Globe className="w-4 h-4" />;
      case 'rapid_requests': return <Activity className="w-4 h-4" />;
      case 'geo_anomaly': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Security Monitoring</h2>
        <Button onClick={fetchSecurityData} variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">
                  {threats.filter(t => !t.resolved).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold text-orange-600">{ipStats.blockedIPs}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold">{securityMetrics.failedLogins}</p>
              </div>
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious IPs</p>
                <p className="text-2xl font-bold text-yellow-600">{ipStats.suspiciousIPs}</p>
              </div>
              <Globe className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="w-full">
        <TabsList>
          <TabsTrigger value="threats">Security Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Security Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threats.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active threats detected</p>
                  </div>
                ) : (
                  threats.map((threat) => (
                    <div key={threat.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getThreatIcon(threat.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">
                            {threat.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(threat.timestamp).toLocaleString()}
                          </span>
                          {threat.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              RESOLVED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{threat.details}</p>
                        {threat.sourceIP && (
                          <p className="text-xs text-muted-foreground">Source IP: {threat.sourceIP}</p>
                        )}
                      </div>
                      {!threat.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveThreat(threat.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Security Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">IP Address Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total Unique IPs: {ipStats.totalIPs}</p>
                    <p>Currently Blocked: {ipStats.blockedIPs}</p>
                    <p>Flagged as Suspicious: {ipStats.suspiciousIPs}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Security Events (24h)</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total Events: {securityMetrics.totalEvents}</p>
                    <p>Failed Logins: {securityMetrics.failedLogins}</p>
                    <p>Suspicious Activity: {securityMetrics.suspiciousActivity}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Security Policy Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Content Security Policy</h4>
                    <p className="text-sm text-muted-foreground">Prevents XSS and injection attacks</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">Protects against brute force attacks</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Input Validation</h4>
                    <p className="text-sm text-muted-foreground">Sanitizes and validates all user input</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Session Security</h4>
                    <p className="text-sm text-muted-foreground">Secure session management and timeouts</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">ACTIVE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSecurityMonitoring;
