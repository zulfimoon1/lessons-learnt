
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

interface AIInsightsAutomationProps {
  pendingNotifications: Array<{
    id: string;
    studentName: string;
    analysis: {
      riskLevel: string;
    };
    scheduledFor: Date;
  }>;
}

const AIInsightsAutomation: React.FC<AIInsightsAutomationProps> = ({
  pendingNotifications
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Automated Notifications
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure automated alerts and teacher notifications
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingNotifications.map(notification => (
            <div key={notification.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{notification.studentName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {notification.analysis.riskLevel.toUpperCase()} risk detected
                  </p>
                </div>
                <Badge variant={notification.analysis.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                  {notification.analysis.riskLevel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scheduled: {notification.scheduledFor.toLocaleString()}
              </p>
            </div>
          ))}
          
          {pendingNotifications.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No pending notifications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsAutomation;
