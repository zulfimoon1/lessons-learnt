
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  alert_type: string;
  content: string;
  source_table: string;
  severity_level: number;
  is_reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export const useMentalHealthAlerts = () => {
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { teacher } = useAuth();

  const fetchAlerts = async () => {
    try {
      // Check if user is authorized (teacher with doctor or admin role)
      if (!teacher || !['doctor', 'admin'].includes(teacher.role)) {
        console.log('User not authorized to view mental health alerts');
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mental health alerts:', error);
        throw error;
      }
      
      setAlerts(data || []);
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      toast({
        title: t('common.error'),
        description: t('teacher.failedToLoadSummaries'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      if (!teacher || !['doctor', 'admin'].includes(teacher.role)) {
        toast({
          title: t('common.error'),
          description: "You are not authorized to review alerts",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mental_health_alerts')
        .update({
          is_reviewed: true,
          reviewed_by: teacher.name,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('school', teacher.school);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "The alert has been marked as reviewed",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as reviewed:', error);
      toast({
        title: t('common.error'),
        description: "Failed to mark alert as reviewed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [teacher]);

  const unreviewed = alerts.filter(alert => !alert.is_reviewed);
  const critical = alerts.filter(alert => alert.severity_level >= 5);

  return {
    alerts,
    isLoading,
    unreviewed,
    critical,
    markAsReviewed,
    fetchAlerts
  };
};
