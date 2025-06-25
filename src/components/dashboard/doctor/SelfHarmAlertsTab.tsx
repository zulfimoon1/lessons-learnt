
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Calendar, Shield, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SelfHarmAlert {
  id: string;
  student_name: string;
  grade: string;
  content: string;
  severity_level: number;
  created_at: string;
  is_reviewed: boolean;
  school: string;
}

interface SelfHarmAlertsTabProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const SelfHarmAlertsTab: React.FC<SelfHarmAlertsTabProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SelfHarmAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [teacher.school]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        toast({
          title: t('common.error'),
          description: t('doctor.dashboard.alertsLoadError'),
          variant: 'destructive'
        });
        return;
      }

      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: t('common.error'),
        description: t('doctor.dashboard.alertsLoadError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({ 
          is_reviewed: true,
          reviewed_by: teacher.name,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert:', error);
        toast({
          title: t('common.error'),
          description: t('doctor.dashboard.markReviewedError'),
          variant: 'destructive'
        });
        return;
      }

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_reviewed: true } : alert
      ));
      
      toast({
        title: t('common.success'),
        description: t('doctor.dashboard.markReviewed'),
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: t('common.error'),
        description: t('doctor.dashboard.markReviewedError'),
        variant: 'destructive'
      });
    }
  };

  const getSeverityColor = (level: number) => {
    if (level >= 5) return 'destructive';
    if (level >= 4) return 'secondary';
    return 'outline';
  };

  const getSeverityText = (level: number) => {
    if (level >= 5) return t('doctor.dashboard.highRiskLevel');
    if (level >= 4) return t('doctor.dashboard.mediumRiskLevel');
    return t('doctor.dashboard.lowRiskLevel');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">{t('doctor.dashboard.loading')}</span>
      </div>
    );
  }

  const unreviewed = alerts.filter(alert => !alert.is_reviewed);
  const criticalAlerts = alerts.filter(alert => alert.severity_level >= 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('doctor.dashboard.selfHarmAlerts')}</p>
                <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('doctor.dashboard.unreviewed')}</p>
                <p className="text-2xl font-bold text-orange-600">{unreviewed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-800" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('doctor.dashboard.immediateAttention')}</p>
                <p className="text-2xl font-bold text-red-800">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {t('doctor.dashboard.selfHarmAlerts')}
            <Badge variant="outline" className="ml-2">
              <Shield className="w-3 h-3 mr-1" />
              {t('doctor.dashboard.confidentialData')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('doctor.dashboard.noAlerts')}</p>
              <p className="text-sm text-gray-500 mt-2">
                {t('doctor.dashboard.noAlertsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-brand-dark">{alert.student_name}</h3>
                        <Badge variant={getSeverityColor(alert.severity_level)}>
                          {getSeverityText(alert.severity_level)}
                        </Badge>
                        <Badge variant="outline" className="border-red-200 text-red-800 bg-red-50">
                          <Shield className="w-3 h-3 mr-1" />
                          {t('doctor.dashboard.confidentialData')}
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
                          {t('dashboard.grade')} {alert.grade}
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
                  <div className="bg-red-100/50 p-3 rounded border-l-4 border-red-400">
                    <p className="text-sm text-red-900 font-medium mb-1">
                      ⚠️ {t('doctor.dashboard.immediateAttention')}
                    </p>
                    <p className="text-sm text-red-800">{alert.content}</p>
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

export default SelfHarmAlertsTab;
