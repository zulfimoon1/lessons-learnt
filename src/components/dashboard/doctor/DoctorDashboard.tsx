
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Calendar, Heart, MessageSquare, User, Eye, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMentalHealthAlerts } from "@/hooks/useMentalHealthAlerts";
import WellnessCheckCard from "./WellnessCheckCard";


interface DoctorDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ teacher }) => {
  const { alerts, isLoading: isLoadingAlerts, isAuthorized, markAsReviewed } = useMentalHealthAlerts();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    console.log('DoctorDashboard: Initializing for doctor:', teacher.name, 'at school:', teacher.school);
  }, [teacher.school]);

  const getSeverityColor = (level: number) => {
    if (level >= 5) return 'destructive';
    if (level >= 3) return 'secondary';
    return 'outline';
  };

  const getSeverityText = (level: number) => {
    if (level >= 5) return 'High Risk';
    if (level >= 3) return 'Medium Risk';
    return 'Low Risk';
  };

  if (isLoadingAlerts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">Loading medical dashboard...</span>
      </div>
    );
  }

  const unreviewed = alerts.filter(alert => !alert.is_reviewed);
  const highRiskAlerts = alerts.filter(alert => alert.severity_level >= 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wellness Checks</p>
                <p className="text-2xl font-bold text-brand-dark">Monitor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mental Health Alerts</p>
                <p className="text-2xl font-bold text-brand-dark">
                  {isAuthorized ? alerts.length : '⚠'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unreviewed</p>
                <p className="text-2xl font-bold text-red-600">
                  {isAuthorized ? unreviewed.length : '⚠'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {isAuthorized ? highRiskAlerts.length : '⚠'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Check Card */}
      <WellnessCheckCard school={teacher.school} />

      {/* Main Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-orange" />
            Medical Dashboard - {teacher.school}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monitor student wellness and mental health alerts
          </p>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            {!isAuthorized ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Access to mental health alerts requires proper authorization</p>
                <p className="text-sm text-gray-500">Contact your system administrator for medical data access</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No mental health alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 bg-red-50/30">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-brand-dark">{alert.student_name}</h3>
                          <Badge variant={getSeverityColor(alert.severity_level)}>
                            {getSeverityText(alert.severity_level)}
                          </Badge>
                          {alert.is_reviewed && (
                            <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">
                              Reviewed
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Grade {alert.grade}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!alert.is_reviewed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsReviewed(alert.id)}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                    <div className="bg-red-100/50 p-3 rounded border-l-4 border-red-300">
                      <p className="text-sm text-red-800">{alert.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
