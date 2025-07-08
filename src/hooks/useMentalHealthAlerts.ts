
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { admin } = usePlatformAdmin();
  const { teacher } = useAuth();

  const checkAuthorization = async () => {
    try {
      // Check if user is a doctor from the teacher context
      if (teacher?.role === 'doctor') {
        console.log('Doctor authorization confirmed:', teacher.name);
        setIsAuthorized(true);
        return true;
      }

      // Also check platform admin access
      if (admin?.email) {
        console.log('Platform admin access confirmed:', admin.email);
        setIsAuthorized(true);
        return true;
      }

      console.log('No medical authorization found - user role:', teacher?.role);
      setIsAuthorized(false);
      return false;
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

      // For doctors, fetch directly from database using RLS policies
      if (teacher?.role === 'doctor') {
        console.log('🧠 Fetching mental health alerts for doctor:', teacher.school);
        const { data, error } = await supabase
          .from('mental_health_alerts')
          .select('*')
          .eq('school', teacher.school)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching mental health alerts:', error);
          setAlerts([]);
          return;
        }

        console.log('✅ Mental health alerts fetched for doctor:', data?.length || 0);
        setAlerts(data || []);
        return;
      }

      // For platform admins, use edge function
      if (admin?.email) {
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
    if (admin?.email || teacher?.role === 'doctor') {
      fetchAlerts();
    }
  }, [admin, teacher]);

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
