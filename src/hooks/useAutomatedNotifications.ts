
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DistressAnalysis } from '@/services/multiLanguageDistressService';
import { useToast } from './use-toast';

interface NotificationRule {
  id: string;
  triggerLevel: 'high' | 'critical';
  notifyTeachers: boolean;
  notifyAdmins: boolean;
  notifyParents: boolean;
  delayMinutes: number;
  isActive: boolean;
}

interface PendingNotification {
  id: string;
  studentId: string;
  studentName: string;
  school: string;
  analysis: DistressAnalysis;
  scheduledFor: Date;
  notificationsSent: string[];
}

export const useAutomatedNotifications = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const { toast } = useToast();

  // Load notification rules on mount
  useEffect(() => {
    const defaultRules: NotificationRule[] = [
      {
        id: 'critical-immediate',
        triggerLevel: 'critical',
        notifyTeachers: true,
        notifyAdmins: true,
        notifyParents: false, // Require manual parent notification for privacy
        delayMinutes: 0,
        isActive: true
      },
      {
        id: 'high-delayed',
        triggerLevel: 'high',
        notifyTeachers: true,
        notifyAdmins: false,
        notifyParents: false,
        delayMinutes: 15,
        isActive: true
      }
    ];
    
    setRules(defaultRules);
  }, []);

  const scheduleNotification = useCallback(async (
    studentId: string,
    studentName: string,
    school: string,
    analysis: DistressAnalysis
  ) => {
    const applicableRules = rules.filter(rule => 
      rule.isActive && (
        (rule.triggerLevel === 'critical' && analysis.riskLevel === 'critical') ||
        (rule.triggerLevel === 'high' && (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical'))
      )
    );

    for (const rule of applicableRules) {
      const notificationId = crypto.randomUUID();
      const scheduledFor = new Date(Date.now() + rule.delayMinutes * 60000);
      
      const pendingNotification: PendingNotification = {
        id: notificationId,
        studentId,
        studentName,
        school,
        analysis,
        scheduledFor,
        notificationsSent: []
      };

      setPendingNotifications(prev => [...prev, pendingNotification]);

      // For immediate notifications (critical cases)
      if (rule.delayMinutes === 0) {
        await executeNotification(pendingNotification, rule);
      } else {
        // Schedule delayed notification
        setTimeout(() => {
          executeNotification(pendingNotification, rule);
        }, rule.delayMinutes * 60000);
      }
    }
  }, [rules]);

  const executeNotification = useCallback(async (
    notification: PendingNotification,
    rule: NotificationRule
  ) => {
    try {
      const notifications = [];

      // Notify teachers
      if (rule.notifyTeachers) {
        const { data: teachers } = await supabase
          .from('teachers')
          .select('email, name')
          .eq('school', notification.school);

        if (teachers) {
          for (const teacher of teachers) {
            notifications.push({
              type: 'teacher',
              recipient: teacher.email,
              subject: `Student Mental Health Alert - ${notification.studentName}`,
              content: `A ${notification.analysis.riskLevel} risk level has been detected in feedback from ${notification.studentName}. Please consider reaching out to provide support.`
            });
          }
        }
      }

      // Notify admins
      if (rule.notifyAdmins) {
        const { data: admins } = await supabase
          .from('teachers')
          .select('email, name')
          .eq('school', notification.school)
          .eq('role', 'admin');

        if (admins) {
          for (const admin of admins) {
            notifications.push({
              type: 'admin',
              recipient: admin.email,
              subject: `URGENT: Mental Health Alert - ${notification.studentName}`,
              content: `Critical mental health alert detected for student ${notification.studentName}. Immediate intervention may be required.`
            });
          }
        }
      }

      // Show in-app notification
      toast({
        title: notification.analysis.riskLevel === 'critical' ? 'Critical Alert' : 'Mental Health Alert',
        description: `${notification.analysis.riskLevel.toUpperCase()} risk detected for ${notification.studentName}`,
        variant: notification.analysis.riskLevel === 'critical' ? 'destructive' : 'default'
      });

      // Remove from pending notifications
      setPendingNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );

      console.log('Automated notifications scheduled:', notifications);
      
    } catch (error) {
      console.error('Failed to execute notification:', error);
    }
  }, [toast]);

  const cancelNotification = useCallback((notificationId: string) => {
    setPendingNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  const updateNotificationRules = useCallback((newRules: NotificationRule[]) => {
    setRules(newRules);
  }, []);

  const getNotificationHistory = useCallback(async (studentId?: string) => {
    try {
      let query = supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching notification history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotificationHistory:', error);
      return [];
    }
  }, []);

  return {
    scheduleNotification,
    cancelNotification,
    updateNotificationRules,
    getNotificationHistory,
    pendingNotifications,
    rules
  };
};

export default useAutomatedNotifications;
