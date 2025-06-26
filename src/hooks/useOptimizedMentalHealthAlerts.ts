
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  alert_type: string;
  content: string;
  severity_level: number;
  is_reviewed: boolean;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

interface AlertStats {
  total: number;
  unreviewed: number;
  critical: number;
  bySchool: Record<string, number>;
  criticalAlerts: MentalHealthAlert[];
}

export const useOptimizedMentalHealthAlerts = () => {
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { teacher } = useAuth();

  // Check if user is authorized to view mental health data
  const isAuthorized = useMemo(() => {
    return teacher && (teacher.role === 'doctor' || teacher.role === 'admin');
  }, [teacher]);

  // Generate alert statistics
  const alertStats = useMemo((): AlertStats => {
    const stats = {
      total: alerts.length,
      unreviewed: alerts.filter(alert => !alert.is_reviewed).length,
      critical: alerts.filter(alert => alert.severity_level > 7).length,
      bySchool: {} as Record<string, number>,
      criticalAlerts: alerts.filter(alert => alert.severity_level > 7)
    };

    alerts.forEach(alert => {
      stats.bySchool[alert.school] = (stats.bySchool[alert.school] || 0) + 1;
    });

    return stats;
  }, [alerts]);

  const fetchAlerts = useCallback(async (force = false) => {
    if (!isAuthorized) {
      console.log('useOptimizedMentalHealthAlerts: User not authorized for mental health data');
      setIsLoading(false);
      return;
    }

    // Implement caching - only fetch if more than 30 seconds have passed
    const now = Date.now();
    if (!force && (now - lastFetchTime) < 30000) {
      console.log('useOptimizedMentalHealthAlerts: Using cached data');
      return;
    }

    try {
      console.log('useOptimizedMentalHealthAlerts: Fetching mental health alerts');
      setIsLoading(true);

      // Fetch alerts with optimized query
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false })
        .order('severity_level', { ascending: false });

      if (error) {
        console.error('useOptimizedMentalHealthAlerts: Error fetching alerts:', error);
        throw error;
      }

      console.log('useOptimizedMentalHealthAlerts: Fetched alerts:', data?.length || 0);
      setAlerts(data || []);
      setLastFetchTime(now);
    } catch (error) {
      console.error('useOptimizedMentalHealthAlerts: Error:', error);
      toast.error('Failed to load mental health alerts');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, teacher, lastFetchTime]);

  const markAsReviewed = useCallback(async (alertId: string) => {
    if (!isAuthorized || !teacher) {
      console.error('useOptimizedMentalHealthAlerts: Not authorized to mark as reviewed');
      return;
    }

    try {
      console.log('useOptimizedMentalHealthAlerts: Marking alert as reviewed:', alertId);

      const { error } = await supabase
        .from('mental_health_alerts')
        .update({
          is_reviewed: true,
          reviewed_by: teacher.email,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('useOptimizedMentalHealthAlerts: Error marking as reviewed:', error);
        throw error;
      }

      // Optimistically update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                is_reviewed: true, 
                reviewed_by: teacher.email,
                reviewed_at: new Date().toISOString()
              }
            : alert
        )
      );

      toast.success('Alert marked as reviewed');
    } catch (error) {
      console.error('useOptimizedMentalHealthAlerts: Error marking as reviewed:', error);
      toast.error('Failed to mark alert as reviewed');
    }
  }, [isAuthorized, teacher]);

  const refreshAlerts = useCallback(() => {
    console.log('useOptimizedMentalHealthAlerts: Force refreshing alerts');
    fetchAlerts(true);
  }, [fetchAlerts]);

  // Initial load
  useEffect(() => {
    if (isAuthorized) {
      fetchAlerts();
    }
  }, [isAuthorized, fetchAlerts]);

  // Set up real-time subscription for new alerts
  useEffect(() => {
    if (!isAuthorized || !teacher) return;

    console.log('useOptimizedMentalHealthAlerts: Setting up real-time subscription');
    
    const channel = supabase
      .channel(`mental_health_alerts_${teacher.school}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mental_health_alerts',
          filter: `school=eq.${teacher.school}`
        },
        (payload) => {
          console.log('useOptimizedMentalHealthAlerts: Real-time update:', payload);
          refreshAlerts();
        }
      )
      .subscribe();

    return () => {
      console.log('useOptimizedMentalHealthAlerts: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [isAuthorized, teacher, refreshAlerts]);

  return {
    alerts,
    isLoading,
    isAuthorized,
    alertStats,
    markAsReviewed,
    refreshAlerts,
    fetchAlerts
  };
};
