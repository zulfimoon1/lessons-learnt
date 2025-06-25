
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { admin } = usePlatformAdmin();

  const checkAuthorization = async () => {
    try {
      // Only platform admins and medical professionals can access mental health data
      if (!admin?.email) {
        console.log('No admin context available for mental health access');
        setIsAuthorized(false);
        return false;
      }

      // Verify user has proper medical credentials through edge function
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'verifyMedicalAccess',
          adminEmail: admin.email
        }
      });

      if (error || !data?.success) {
        console.warn('Mental health access verification failed:', error || data?.error);
        setIsAuthorized(false);
        return false;
      }

      setIsAuthorized(true);
      return true;
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
      return false;
    }
  };

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      
      const authorized = await checkAuthorization();
      if (!authorized) {
        console.log('User not authorized for mental health data access');
        setAlerts([]);
        return;
      }

      console.log('🧠 Fetching mental health alerts via secure edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getMentalHealthAlerts',
          adminEmail: admin.email
        }
      });

      if (error) {
        console.error('Error fetching mental health alerts:', error);
        setAlerts([]);
        return;
      }
      
      if (data?.success) {
        console.log('✅ Mental health alerts fetched securely:', data.data?.length || 0);
        setAlerts(data.data || []);
      } else {
        console.warn('Mental health alerts request unsuccessful:', data?.error);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      if (!isAuthorized) {
        toast({
          title: t('common.error'),
          description: "Unauthorized access to mental health data",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Marking alert as reviewed via secure edge function...');
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
          description: "The alert has been securely marked as reviewed",
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
    isAuthorized,
    unreviewed,
    critical,
    markAsReviewed,
    fetchAlerts
  };
};
