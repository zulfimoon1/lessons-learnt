
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Calendar, Heart, MessageSquare, User, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

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
        title: t('common.error'),
        description: t('teacher.failedToLoadData'),
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
        title: t('teacher.alertReviewed'),
        description: t('teacher.alertMarkedReviewed'),
      });
    } catch (error) {
      console.error('Error reviewing alert:', error);
      toast({
        title: t('common.error'),
        description: t('teacher.failedReviewAlert'),
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
    if (level >= 5) return t('teacher.highRisk');
    if (level >= 3) return t('teacher.mediumRisk');
    return t('teacher.lowRisk');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
            <span className="ml-3 text-brand-dark">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  const unreviewed = mentalHealthAlerts.filter(alert => !alert.is_reviewed);
  const highRiskAlerts = mentalHealthAlerts.filter(alert => alert.severity_level >= 5);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Overview Cards - solid white background for better contrast */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('teacher.weeklySummaries')}</p>
                  <p className="text-2xl font-bold text-brand-dark">{weeklySummaries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('teacher.mentalHealthAlerts')}</p>
                  <p className="text-2xl font-bold text-brand-dark">{mentalHealthAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('teacher.unreviewed')}</p>
                  <p className="text-2xl font-bold text-red-600">{unreviewed.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('teacher.highRisk')}</p>
                  <p className="text-2xl font-bold text-red-600">{highRiskAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs - solid white background */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <Tabs defaultValue="alerts" className="w-full">
            {/* Tab Navigation - clean white background */}
            <div className="bg-white border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
                <TabsTrigger 
                  value="alerts" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('teacher.mentalHealthAlerts')}
                </TabsTrigger>
                <TabsTrigger 
                  value="summaries" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('teacher.weeklySummaries')}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <TabsContent value="alerts" className="mt-0">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-brand-dark">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      {t('teacher.mentalHealthAlerts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mentalHealthAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{t('teacher.noAlertsAtThisTime')}</p>
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
                                      {t('teacher.reviewed')}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {t('teacher.grade')} {alert.grade}
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
                                  {t('teacher.markAsReviewed')}
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
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-brand-dark">
                      <Calendar className="w-5 h-5 text-brand-teal" />
                      {t('teacher.weeklySummaries')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weeklySummaries.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{t('teacher.noSummariesYet')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {weeklySummaries.map((summary) => (
                          <div key={summary.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-brand-dark">{summary.student_name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{t('teacher.grade')} {summary.grade}</span>
                                  <span>{t('teacher.weekFrom')} {new Date(summary.week_start_date).toLocaleDateString()}</span>
                                  <span>{t('teacher.submitted')} {new Date(summary.submitted_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {summary.emotional_concerns && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">{t('teacher.emotionalConcerns')}:</h4>
                                <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-200 text-brand-dark">
                                  {summary.emotional_concerns}
                                </p>
                              </div>
                            )}
                            
                            {summary.academic_concerns && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">{t('teacher.academicConcerns')}:</h4>
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
    </div>
  );
};

export default DoctorDashboard;
