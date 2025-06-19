
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";

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
  const { admin } = usePlatformAdmin();

  const fetchAlerts = async () => {
    try {
      if (!admin?.email) {
        console.log('No admin context available');
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      console.log('🧠 Fetching mental health alerts via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getMentalHealthAlerts',
          adminEmail: admin.email
        }
      });

      if (error) {
        console.error('Error fetching mental health alerts:', error);
        throw error;
      }
      
      if (data?.success) {
        console.log('✅ Mental health alerts fetched:', data.data?.length || 0);
        setAlerts(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch mental health alerts');
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load mental health alerts',
        variant: "destructive",
      });
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      if (!admin?.email) {
        toast({
          title: t('common.error'),
          description: "Admin authentication required",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Marking alert as reviewed via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'markAlertAsReviewed',
          adminEmail: admin.email,
          alertId: alertId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t('common.success'),
          description: "The alert has been marked as reviewed",
        });
        fetchAlerts();
      } else {
        throw new Error(data?.error || 'Failed to mark alert as reviewed');
      }
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
    if (admin?.email) {
      fetchAlerts();
    }
  }, [admin]);

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
