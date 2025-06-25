
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface SOC2AuditEventsProps {
  auditEvents: any[];
}

const SOC2AuditEvents: React.FC<SOC2AuditEventsProps> = ({ auditEvents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unauthorized': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Audit Events</CardTitle>
        <CardDescription>
          Comprehensive log of all system activities and user actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {auditEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No audit events found</p>
          ) : (
            auditEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(event.result)}
                  <div>
                    <p className="font-medium">{event.event_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.action_performed} on {event.resource_accessed}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SOC2AuditEvents;
