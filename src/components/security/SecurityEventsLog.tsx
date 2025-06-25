
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

interface SecurityEvent {
  type: string;
  details: string;
  timestamp: string;
  userId?: string;
}

interface SecurityEventsLogProps {
  recentEvents: SecurityEvent[];
}

const SecurityEventsLog: React.FC<SecurityEventsLogProps> = ({ recentEvents }) => {
  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'unauthorized_access':
      case 'csrf_violation':
        return 'destructive';
      case 'suspicious_activity':
      case 'rate_limit_exceeded':
        return 'secondary';
      case 'login_failed':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Recent Security Events
        </CardTitle>
        <CardDescription>
          Latest security events and alerts from the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No security events recorded</p>
          ) : (
            recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={getSeverityColor(event.type)}>
                    {event.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{event.details}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {event.userId && (
                  <Badge variant="outline">
                    User: {event.userId.substring(0, 8)}...
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEventsLog;
