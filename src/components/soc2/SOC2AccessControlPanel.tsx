
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Lock, AlertTriangle } from 'lucide-react';
import { mfaEnforcementService } from '@/services/security/mfaEnforcementService';
import { accessControlMonitorService } from '@/services/security/accessControlMonitorService';

const SOC2AccessControlPanel: React.FC = () => {
  const [privilegedSummary, setPrivilegedSummary] = useState<any>(null);
  const [accessPatterns, setAccessPatterns] = useState<any[]>([]);
  const [privilegedActivity, setPrivilegedActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadAccessControlData = () => {
      const summary = accessControlMonitorService.getPrivilegedAccessSummary();
      const patterns = accessControlMonitorService.getAccessPatterns();
      const activity = mfaEnforcementService.getPrivilegedUserActivity();

      setPrivilegedSummary(summary);
      setAccessPatterns(patterns);
      setPrivilegedActivity(activity);
    };

    loadAccessControlData();
    const interval = setInterval(loadAccessControlData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!privilegedSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Control Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading access control data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* MFA Compliance Alert */}
      {privilegedSummary.mfaCompliance < 90 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            MFA compliance is below 90% ({privilegedSummary.mfaCompliance.toFixed(1)}%). 
            Review privileged user authentication requirements.
          </AlertDescription>
        </Alert>
      )}

      {/* Access Control Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Privileged Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privilegedSummary.totalPrivilegedUsers}</div>
            <p className="text-xs text-muted-foreground">Active in last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privilegedSummary.activePrivilegedSessions}</div>
            <p className="text-xs text-muted-foreground">Successful access attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failed Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {privilegedSummary.failedPrivilegedAttempts}
            </div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              MFA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {privilegedSummary.mfaCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Privileged users with MFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Patterns by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Patterns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access patterns by user role in the last 24 hours
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium capitalize">{pattern.role}</h4>
                  <p className="text-sm text-muted-foreground">
                    {pattern.resources.length} resources accessed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {pattern.successes} success
                  </Badge>
                  {pattern.failures > 0 && (
                    <Badge variant="destructive">
                      {pattern.failures} failed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {accessPatterns.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No access patterns recorded in the last 24 hours
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Privileged Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Privileged User Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent activity by users with elevated privileges
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {privilegedActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                <div>
                  <span className="font-medium">{activity.action_performed}</span>
                  <span className="text-muted-foreground ml-2">
                    on {activity.resource_accessed}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activity.result === 'success' ? 'default' : 'destructive'}>
                    {activity.result}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {privilegedActivity.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No privileged user activity recorded
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2AccessControlPanel;
