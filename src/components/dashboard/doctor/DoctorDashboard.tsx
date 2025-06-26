
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
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
  const { alerts, isLoading: isLoadingAlerts, isAuthorized, markAsReviewed } = useMentalHealthAlerts();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchWeeklySummaries();
  }, [teacher.school]);

  const fetchWeeklySummaries = async () => {
    try {
      setIsLoadingSummaries(true);

      // Fetch weekly summaries for the school (non-sensitive data)
      const { data: summariesData, error: summariesError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('school', teacher.school)
        .order('submitted_at', { ascending: false });

      if (summariesError) throw summariesError;
      setWeeklySummaries(summariesData || []);
    } catch (error) {
      console.error('Error fetching weekly summaries:', error);
      toast({
        title: t('common.error') || 'Error',
        description: 'Failed to load weekly summaries',
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const getSeverityColor = (level: number) => {
    if (level >= 5) return 'destructive';
    if (level >= 3) return 'secondary';
    return 'outline';
  };

  const getSeverityText = (level: number) => {
    if (level >= 5) return t('doctor.dashboard.highRiskLevel');
    if (level >= 3) return t('doctor.dashboard.mediumRiskLevel');
    return t('doctor.dashboard.lowRiskLevel');
  };

  if (isLoadingAlerts || isLoadingSummaries) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">{t('doctor.dashboard.loading')}</span>
      </div>
    );
  }

  const unreviewed = alerts.filter(alert => !alert.is_reviewed);
  const highRiskAlerts = alerts.filter(alert => alert.severity_level >= 5);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('doctor.dashboard.weeklySummaries')}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.mentalHealthAlerts')}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.unreviewed')}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.highRisk')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {isAuthorized ? highRiskAlerts.length : '⚠'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Check Card */}
      <div className="mb-6">
        <WellnessCheckCard school={teacher.school} />
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <Tabs defaultValue="alerts" className="w-full">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
              <TabsTrigger 
                value="alerts" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t('doctor.dashboard.mentalHealthAlerts')}
                {!isAuthorized && <Shield className="w-3 h-3 ml-1 text-red-400" />}
              </TabsTrigger>
              <TabsTrigger 
                value="summaries" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('doctor.dashboard.weeklySummaries')}
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
                    {t('doctor.dashboard.mentalHealthAlerts')}
                    {isAuthorized && (
                      <Badge variant="outline" className="ml-2">
                        <Shield className="w-3 h-3 mr-1" />
                        Secure Access
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthorized ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Access to mental health alerts requires proper authorization</p>
                      <p className="text-sm text-gray-500">Contact your system administrator for medical data access</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">{t('doctor.dashboard.noAlerts')}</p>
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
                                <Badge variant="outline">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Confidential
                                </Badge>
                                {alert.is_reviewed && (
                                  <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">
                                    {t('doctor.dashboard.reviewed')}
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
                                {t('doctor.dashboard.markReviewed')}
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summaries" className="mt-0">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-dark">
                    <Calendar className="w-5 h-5 text-brand-teal" />
                    {t('doctor.dashboard.weeklySummaries')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklySummaries.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">{t('doctor.dashboard.noSummaries')}</p>
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
                                <span>Week from {new Date(summary.week_start_date).toLocaleDateString()}</span>
                                <span>Submitted {new Date(summary.submitted_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {summary.emotional_concerns && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">{t('doctor.dashboard.emotionalConcerns')}</h4>
                              <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-200 text-brand-dark">
                                {summary.emotional_concerns}
                              </p>
                            </div>
                          )}
                          
                          {summary.academic_concerns && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">{t('doctor.dashboard.academicConcerns')}</h4>
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
    </>
  );
};

export default DoctorDashboard;
