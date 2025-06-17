
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

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
      // Enhanced security validation for mental health data access
      if (!teacher || !['doctor', 'admin'].includes(teacher.role)) {
        console.log('User not authorized to view mental health alerts');
        
        await enhancedSecurityService.logSecurityEvent(
          'unauthorized_mental_health_access',
          `User attempted to access mental health alerts without proper authorization`,
          'high'
        );
        
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      // Validate session before accessing sensitive data
      const isValidSession = await enhancedSecurityService.validateSession();
      if (!isValidSession) {
        toast({
          title: "Session Expired",
          description: "Please log in again to access mental health data",
          variant: "destructive"
        });
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      // Log access to mental health data
      await enhancedSecurityService.logSecurityEvent(
        'mental_health_data_access',
        `User ${teacher.email} accessed mental health alerts for school ${teacher.school}`,
        'medium'
      );

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
      
      await enhancedSecurityService.logSecurityEvent(
        'mental_health_data_error',
        `Error fetching mental health alerts: ${error}`,
        'high'
      );
      
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

      // Validate session for sensitive operation
      const isValidSession = await enhancedSecurityService.validateSession();
      if (!isValidSession) {
        toast({
          title: "Session Expired",
          description: "Please log in again to perform this action",
          variant: "destructive"
        });
        return;
      }

      // Log the review action
      await enhancedSecurityService.logSecurityEvent(
        'mental_health_alert_reviewed',
        `Alert ${alertId} marked as reviewed by ${teacher.name}`,
        'medium'
      );

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
      
      await enhancedSecurityService.logSecurityEvent(
        'mental_health_review_error',
        `Error reviewing alert ${alertId}: ${error}`,
        'high'
      );
      
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
