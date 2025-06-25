
import { useState, useEffect, useMemo } from "react";
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

export const useOptimizedMentalHealthAlerts = () => {
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { admin } = usePlatformAdmin();

  // Memoized computed values for better performance
  const alertStats = useMemo(() => {
    const unreviewed = alerts.filter(alert => !alert.is_reviewed);
    const critical = alerts.filter(alert => alert.severity_level >= 5);
    const bySchool = alerts.reduce((acc, alert) => {
      acc[alert.school] = (acc[alert.school] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: alerts.length,
      unreviewed: unreviewed.length,
      critical: critical.length,
      bySchool,
      unreviewedAlerts: unreviewed,
      criticalAlerts: critical
    };
  }, [alerts]);

  // Optimized authorization check with caching
  const checkAuthorization = useMemo(() => async () => {
    try {
      if (!admin?.email) {
        console.log('No admin context available for mental health access');
        setIsAuthorized(false);
        return false;
      }

      // Cache authorization for 5 minutes to reduce API calls
      const cacheKey = `mental_health_auth_${admin.email}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { authorized, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 300000) { // 5 minutes
          setIsAuthorized(authorized);
          return authorized;
        }
      }

      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'verifyMedicalAccess',
          adminEmail: admin.email
        }
      });

      const authorized = !error && data?.success;
      
      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify({
        authorized,
        timestamp: Date.now()
      }));

      setIsAuthorized(authorized);
      return authorized;
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
      return false;
    }
  }, [admin?.email]);

  // Optimized fetch with intelligent caching
  const fetchAlerts = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Avoid too frequent fetches (minimum 30 seconds between calls)
    if (!forceRefresh && now - lastFetch < 30000) {
      return;
    }

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
          adminEmail: admin.email,
          includeStats: true // Request additional metadata
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
        setLastFetch(now);
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

  // Optimized mark as reviewed with optimistic updates
  const markAsReviewed = async (alertId: string) => {
    if (!isAuthorized) {
      toast({
        title: t('common.error'),
        description: "Unauthorized access to mental health data",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, is_reviewed: true, reviewed_by: admin.email, reviewed_at: new Date().toISOString() }
        : alert
    ));

    try {
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
      } else {
        throw new Error(data?.error || 'Failed to mark alert as reviewed');
      }
    } catch (error) {
      console.error('Error marking alert as reviewed:', error);
      // Revert optimistic update
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_reviewed: false, reviewed_by: undefined, reviewed_at: undefined }
          : alert
      ));
      toast({
        title: t('common.error'),
        description: "Failed to mark alert as reviewed",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh every 5 minutes when authorized
  useEffect(() => {
    if (!admin?.email) return;

    fetchAlerts();
    
    const interval = setInterval(() => {
      if (isAuthorized) {
        fetchAlerts();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [admin?.email, isAuthorized]);

  return {
    alerts,
    isLoading,
    isAuthorized,
    alertStats,
    markAsReviewed,
    fetchAlerts: (forceRefresh?: boolean) => fetchAlerts(forceRefresh),
    refreshAlerts: () => fetchAlerts(true)
  };
};
