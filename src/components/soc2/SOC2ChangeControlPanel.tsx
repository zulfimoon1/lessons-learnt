
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Settings,
  Database
} from 'lucide-react';
import { useChangeControl } from '@/hooks/useChangeControl';

const SOC2ChangeControlPanel: React.FC = () => {
  const { changes, complianceReport, isLoading, approveChange } = useChangeControl();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Change Control Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading change control data...</p>
        </CardContent>
      </Card>
    );
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'configuration': return <Settings className="w-4 h-4" />;
      case 'deployment': return <GitBranch className="w-4 h-4" />;
      case 'security_update': return <Shield className="w-4 h-4" />;
      case 'user_access': return <CheckCircle className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'emergency': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Alerts */}
      {complianceReport?.complianceScore < 90 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Change control compliance is {complianceReport.complianceScore}%. 
            {complianceReport.recentViolations.length} violations require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Total Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceReport?.totalChanges || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {complianceReport?.pendingApprovals || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              High Risk Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complianceReport?.highRiskChanges || 0}
            </div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (complianceReport?.complianceScore || 0) >= 95 ? 'text-green-600' :
              (complianceReport?.complianceScore || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {complianceReport?.complianceScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Approval compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track all system changes and their approval status
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {changes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No changes recorded</p>
            ) : (
              changes.slice(0, 15).map((change) => (
                <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getChangeTypeIcon(change.changeType)}
                    <div>
                      <p className="font-medium">{change.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {change.affectedSystem} • {change.changedBy} • 
                        {new Date(change.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(change.riskLevel)}>
                      {change.riskLevel}
                    </Badge>
                    <Badge variant={getApprovalColor(change.approvalStatus)}>
                      {change.approvalStatus}
                    </Badge>
                    {change.approvalStatus === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveChange(change.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => approveChange(change.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Violations */}
      {complianceReport?.recentViolations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Compliance Violations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent violations that require attention
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceReport.recentViolations.map((violation: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800">{violation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SOC2ChangeControlPanel;
