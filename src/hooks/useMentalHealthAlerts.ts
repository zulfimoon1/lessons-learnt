
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
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
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({
          is_reviewed: true,
          reviewed_by: 'Platform Admin',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "The alert has been marked as reviewed",
      });

      fetchAlerts();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Failed to mark alert as reviewed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

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
