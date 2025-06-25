
import { useState, useEffect, useCallback } from 'react';
import { realTimeNotificationService, RealTimeAlert } from '@/services/realTimeNotificationService';

export const useRealTimeNotifications = (userId: string, role: string, school: string) => {
  const [notifications, setNotifications] = useState<RealTimeAlert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notifications
  useEffect(() => {
    if (!userId || !school || isInitialized) return;

    const initialize = async () => {
      try {
        await realTimeNotificationService.initializeNotifications(userId, role, school);
        setIsInitialized(true);
        console.log('🔔 Real-time notifications initialized');
      } catch (error) {
        console.error('Failed to initialize real-time notifications:', error);
      }
    };

    initialize();
  }, [userId, role, school, isInitialized]);

  // Listen for real-time alerts
  useEffect(() => {
    const handleRealTimeAlert = (event: CustomEvent) => {
      const { alert } = event.detail;
      setNotifications(prev => [alert, ...prev.slice(0, 99)]); // Keep latest 100
      
      if (!alert.acknowledged) {
        setUnacknowledgedCount(prev => prev + 1);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('realTimeAlert', handleRealTimeAlert as EventListener);
      return () => window.removeEventListener('realTimeAlert', handleRealTimeAlert as EventListener);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await realTimeNotificationService.acknowledgeAlert(alertId, userId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === alertId 
            ? { ...notification, acknowledged: true }
            : notification
        )
      );
      
      setUnacknowledgedCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, [userId]);

  const clearNotification = useCallback((alertId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== alertId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnacknowledgedCount(0);
  }, []);

  const getCriticalNotifications = useCallback(() => {
    return notifications.filter(notification => notification.priority === 'critical');
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  return {
    notifications,
    unacknowledgedCount,
    isInitialized,
    acknowledgeAlert,
    clearNotification,
    clearAllNotifications,
    getCriticalNotifications,
    getNotificationsByType,
    notificationStats: {
      total: notifications.length,
      unacknowledged: unacknowledgedCount,
      critical: getCriticalNotifications().length,
      byType: {
        distress: getNotificationsByType('distress').length,
        engagement: getNotificationsByType('engagement').length,
        system: getNotificationsByType('system').length,
        crisis: getNotificationsByType('crisis').length
      }
    }
  };
};

export default useRealTimeNotifications;
