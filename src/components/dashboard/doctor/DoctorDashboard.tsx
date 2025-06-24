
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Calendar, Heart, MessageSquare, User, Eye } from "lucide-react";

interface WeeklySummary {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  week_start_date: string;
  emotional_concerns: string;
  academic_concerns: string;
  submitted_at: string;
}

interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  content: string;
  severity_level: number;
  is_reviewed: boolean;
  created_at: string;
  alert_type: string;
}

interface DoctorDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ teacher }) => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [mentalHealthAlerts, setMentalHealthAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctorData();
  }, [teacher.school]);

  const fetchDoctorData = async () => {
    try {
      setIsLoading(true);

      // Fetch weekly summaries for the school
      const { data: summariesData, error: summariesError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('school', teacher.school)
        .order('submitted_at', { ascending: false });

      if (summariesError) throw summariesError;

      // Fetch mental health alerts for the school
      const { data: alertsData, error: alertsError } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      setWeeklySummaries(summariesData || []);
      setMentalHealthAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({ is_reviewed: true, reviewed_by: teacher.name })
        .eq('id', alertId);

      if (error) throw error;

      setMentalHealthAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_reviewed: true } : alert
        )
      );

      toast({
        title: "Alert reviewed",
        description: "Mental health alert marked as reviewed",
      });
    } catch (error) {
      console.error('Error reviewing alert:', error);
      toast({
        title: "Error",
        description: "Failed to mark alert as reviewed",
        variant: "destructive",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">Loading doctor dashboard...</span>
      </div>
    );
  }

  const unreviewed = mentalHealthAlerts.filter(alert => !alert.is_reviewed);
  const highRiskAlerts = mentalHealthAlerts.filter(alert => alert.severity_level >= 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards - matching student/teacher dashboard style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Summaries</p>
                <p className="text-2xl font-bold text-brand-dark">{weeklySummaries.length}</p>
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
                <p className="text-2xl font-bold text-brand-dark">{mentalHealthAlerts.length}</p>
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
                <p className="text-sm text-gray-600">Unreviewed Alerts</p>
                <p className="text-2xl font-bold text-red-600">{unreviewed.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{highRiskAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs - matching teacher/student dashboard style */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <Tabs defaultValue="alerts" className="w-full">
          {/* Tab Navigation - clean white background */}
          <div className="bg-white border-b border-gray-200">
            <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
              <TabsTrigger 
                value="alerts" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Mental Health Alerts
              </TabsTrigger>
              <TabsTrigger 
                value="summaries" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Weekly Summaries
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <TabsContent value="alerts" className="mt-0">
              <Card className="bg-white border-gray-200/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-dark">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Mental Health Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mentalHealthAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No mental health alerts at this time</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mentalHealthAlerts.map((alert) => (
                        <div key={alert.id} className="border border-gray-200 rounded-lg p-4 bg-white">
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
                                onClick={() => handleReviewAlert(alert.id)}
                                className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Mark Reviewed
                              </Button>
                            )}
                          </div>
                          <p className="text-sm bg-gray-50 p-3 rounded border text-brand-dark">{alert.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summaries" className="mt-0">
              <Card className="bg-white border-gray-200/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-dark">
                    <Calendar className="w-5 h-5 text-brand-teal" />
                    Weekly Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklySummaries.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No weekly summaries submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {weeklySummaries.map((summary) => (
                        <div key={summary.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-brand-dark">{summary.student_name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Grade {summary.grade}</span>
                                <span>Week of {new Date(summary.week_start_date).toLocaleDateString()}</span>
                                <span>Submitted {new Date(summary.submitted_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {summary.emotional_concerns && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Emotional Concerns:</h4>
                              <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-200 text-brand-dark">
                                {summary.emotional_concerns}
                              </p>
                            </div>
                          )}
                          
                          {summary.academic_concerns && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Academic Concerns:</h4>
                              <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200 text-brand-dark">
                                {summary.academic_concerns}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
