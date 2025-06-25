
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';

const SOC2SystemMonitoringPanel: React.FC = () => {
  const { metrics, alerts, availabilityReport, isLoading } = useSystemMonitoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading system monitoring data...</p>
        </CardContent>
      </Card>
    );
  }

  const getAvailabilityStatus = (availability: number) => {
    if (availability >= 99.9) return { icon: CheckCircle, color: 'text-green-600', status: 'Excellent' };
    if (availability >= 99.5) return { icon: CheckCircle, color: 'text-yellow-600', status: 'Good' };
    return { icon: XCircle, color: 'text-red-600', status: 'Poor' };
  };

  const availabilityStatus = getAvailabilityStatus(metrics?.availability || 0);
  const StatusIcon = availabilityStatus.icon;

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {alerts.some(alert => alert.severity === 'critical') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.filter(alert => alert.severity === 'critical').length} critical system alerts require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* System Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${availabilityStatus.color}`} />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.availability}%</div>
            <p className="text-xs text-muted-foreground">{availabilityStatus.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Error percentage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uptime}h</div>
            <p className="text-xs text-muted-foreground">System uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Availability Report */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Availability Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {availabilityReport?.averageAvailability}%
              </div>
              <p className="text-sm text-muted-foreground">Average Availability</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {availabilityReport?.incidents}
              </div>
              <p className="text-sm text-muted-foreground">Incidents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {availabilityReport?.totalDowntime}min
              </div>
              <p className="text-sm text-muted-foreground">Total Downtime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent system performance and availability alerts
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No performance alerts</p>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-2">{alert.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2SystemMonitoringPanel;
