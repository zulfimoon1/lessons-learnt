
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Calendar, User, School, Shield } from "lucide-react";
import { useOptimizedMentalHealthAlerts } from "@/hooks/useOptimizedMentalHealthAlerts";

const MentalHealthAlerts = () => {
  const { alerts, isLoading, isAuthorized, markAsReviewed } = useOptimizedMentalHealthAlerts();

  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Mental health data access requires proper medical authorization
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            This sensitive data is only accessible to authorized medical professionals
          </p>
          <p className="text-sm text-gray-500">
            Contact your system administrator if you believe you should have access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Mental Health Alerts
                <Badge variant="outline" className="ml-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure Access
                </Badge>
              </CardTitle>
              <CardDescription>
                Monitor and review mental health concerns detected in student submissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
              <p>Securely loading mental health alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No mental health alerts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="border rounded-md p-4 bg-red-50/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-red-900">{alert.student_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <School className="w-4 h-4" />
                        <span>{alert.school}</span>
                        <User className="w-4 h-4" />
                        <span>Grade {alert.grade}</span>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={alert.severity_level > 7 ? "destructive" : "secondary"}
                      >
                        Risk Level: {alert.severity_level}
                      </Badge>
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        Confidential
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-red-100/50 rounded border-l-4 border-red-300">
                    <p className="text-sm text-red-800">{alert.content}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    {!alert.is_reviewed ? (
                      <Button
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentalHealthAlerts;
