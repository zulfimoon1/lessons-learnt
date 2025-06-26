
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Eye, Calendar, User, School, Shield } from "lucide-react";

interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  alert_type: string;
  content: string;
  severity_level: number;
  is_reviewed: boolean;
  created_at: string;
  reviewed_by?: string;
}

interface MentalHealthAlertsProps {
  alerts: MentalHealthAlert[];
  isLoading: boolean;
  isAuthorized: boolean;
  markAsReviewed: (alertId: string) => void;
}

const MentalHealthAlerts: React.FC<MentalHealthAlertsProps> = memo(({ 
  alerts, 
  isLoading, 
  isAuthorized, 
  markAsReviewed 
}) => {
  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Medical authorization required</p>
          <p className="text-sm text-gray-500">Contact system administrator for access</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mental health alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Mental Health Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No alerts found</p>
          <p className="text-sm text-gray-500 mt-2">All students appear to be doing well</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Mental Health Alerts
          <Badge variant="outline" className="ml-auto">
            <Shield className="w-3 h-3 mr-1" />
            Secure
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="border rounded-lg p-4 bg-red-50/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">{alert.student_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <School className="w-4 h-4" />
                        <span>{alert.school}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Grade {alert.grade}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={alert.severity_level > 7 ? "destructive" : "secondary"}
                    className="ml-4"
                  >
                    Severity: {alert.severity_level}
                  </Badge>
                </div>
                
                <div className="mb-4 p-3 bg-red-100/70 rounded text-sm text-red-800">
                  <strong>Alert Type:</strong> {alert.alert_type}
                  <br />
                  <strong>Content:</strong> {alert.content}
                </div>
                
                <div className="flex justify-end">
                  {!alert.is_reviewed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsReviewed(alert.id)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Mark as Reviewed
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Reviewed
                      </Badge>
                      {alert.reviewed_by && (
                        <span className="text-xs text-gray-500">
                          by {alert.reviewed_by}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

MentalHealthAlerts.displayName = 'MentalHealthAlerts';

export default MentalHealthAlerts;
