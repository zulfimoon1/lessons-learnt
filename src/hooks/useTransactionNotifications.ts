
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TransactionNotification {
  id: string;
  recipient_email: string;
  recipient_type: string;
  title: string;
  message: string;
  notification_type: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useTransactionNotifications = () => {
  const [notifications, setNotifications] = useState<TransactionNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('recipient_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead
  };
};
