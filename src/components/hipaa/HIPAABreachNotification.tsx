
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, FileText } from 'lucide-react';

const HIPAABreachNotification: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Breach Notification System
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor and manage HIPAA breach incidents and notifications
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Breach Incidents</h3>
          <p className="text-muted-foreground mb-4">
            Your system is currently free of reported HIPAA breach incidents.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Breach Response Plan
            </Button>
            <Button variant="outline">
              Report Incident
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAABreachNotification;
