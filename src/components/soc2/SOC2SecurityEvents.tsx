
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface SOC2SecurityEventsProps {
  securityEvents: any[];
}

const SOC2SecurityEvents: React.FC<SOC2SecurityEventsProps> = ({ securityEvents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events</CardTitle>
        <CardDescription>
          Security incidents and anomalies requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No security events found</p>
          ) : (
            securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-4 h-4 ${
                    event.risk_level === 'critical' ? 'text-red-500' :
                    event.risk_level === 'high' ? 'text-orange-500' :
                    event.risk_level === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{event.event_category}</p>
                    <p className="text-sm text-muted-foreground">{event.event_description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getSeverityColor(event.risk_level)}>{event.risk_level}</Badge>
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

export default SOC2SecurityEvents;
