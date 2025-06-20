import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Calendar, User, School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  reviewed_at?: string;
}

const MentalHealthAlerts = () => {
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching alerts:", error);
        toast({
          title: "Error",
          description: "Failed to load mental health alerts",
          variant: "destructive",
        });
      } else {
        setAlerts(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({ is_reviewed: true })
        .eq('id', alertId);

      if (error) {
        console.error("Error marking alert as reviewed:", error);
        toast({
          title: "Error",
          description: "Failed to mark alert as reviewed",
          variant: "destructive",
        });
      } else {
        setAlerts(prevAlerts =>
          prevAlerts.map(alert =>
            alert.id === alertId ? { ...alert, is_reviewed: true } : alert
          )
        );
        toast({
          title: "Success",
          description: "Alert marked as reviewed",
        });
      }
    } catch (error) {
      console.error("Error during review process:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Mental Health Alerts
              </CardTitle>
              <CardDescription>
                Monitor and review mental health concerns detected in student submissions
              </CardDescription>
            </div>
            <Button onClick={loadAlerts} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p>No mental health alerts found.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{alert.student_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <School className="w-4 h-4" />
                        <span>{alert.school}</span>
                        <User className="w-4 h-4" />
                        <span>Grade {alert.grade}</span>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant={alert.severity_level > 7 ? "destructive" : "secondary"}
                      >
                        Severity: {alert.severity_level}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2">{alert.content}</p>
                  <div className="mt-4 flex justify-end">
                    {!alert.is_reviewed ? (
                      <Button
                        variant="outline"
                        onClick={() => handleReviewAlert(alert.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    ) : (
                      <Badge variant="secondary">Reviewed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentalHealthAlerts;
