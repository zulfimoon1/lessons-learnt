
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  AlertTriangle, 
  Activity,
  Database,
  Users,
  TrendingUp
} from 'lucide-react';
import { SOC2DashboardData } from '@/services/soc2ComplianceService';

interface SOC2OverviewCardsProps {
  dashboardData: SOC2DashboardData | null;
}

const SOC2OverviewCards: React.FC<SOC2OverviewCardsProps> = ({ dashboardData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audit Events (24h)</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.auditEvents24h || 0}</div>
          <p className="text-xs text-muted-foreground">
            Security and compliance events logged
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Events (24h)</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.securityEvents24h || 0}</div>
          <p className="text-xs text-muted-foreground">
            {dashboardData?.criticalAlerts || 0} critical alerts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardData?.systemHealth === 'healthy' ? '✅ Healthy' : 
             dashboardData?.systemHealth === 'warning' ? '⚠️ Warning' : '❌ Critical'}
          </div>
          <p className="text-xs text-muted-foreground">
            Overall system status
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Access Events</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.dataAccessEvents24h || 0}</div>
          <p className="text-xs text-muted-foreground">
            Database operations (24h)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.complianceScore || 0}%</div>
          <p className="text-xs text-muted-foreground">
            Overall compliance rating
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Violations</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{dashboardData?.recentViolations || 0}</div>
          <p className="text-xs text-muted-foreground">
            Security policy violations
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2OverviewCards;
