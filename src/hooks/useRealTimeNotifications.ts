import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeNotificationService, RealTimeAlert } from '@/services/realTimeNotificationService';

export const useRealTimeNotifications = (userId: string, role: string, school: string) => {
  const [notifications, setNotifications] = useState<RealTimeAlert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef<string>('');

  // Initialize notifications with subscription guard
  useEffect(() => {
    if (!userId || !school) return;
    
    // Prevent duplicate initialization for same user/school combination
    const initKey = `${userId}-${school}`;
    if (initializationRef.current === initKey) return;
    
    const initialize = async () => {
      try {
        await realTimeNotificationService.initializeNotifications(userId, role, school);
        initializationRef.current = initKey;
        setIsInitialized(true);
        console.log('🔔 Real-time notifications initialized for:', { userId, role, school });
      } catch (error) {
        console.error('Failed to initialize real-time notifications:', error);
        initializationRef.current = '';
      }
    };

    initialize();
    
    // Cleanup on unmount or user/school change
    return () => {
      if (initializationRef.current === initKey) {
        realTimeNotificationService.cleanup();
        initializationRef.current = '';
        setIsInitialized(false);
      }
    };
  }, [userId, role, school]);

  // Listen for real-time alerts with proper cleanup
  useEffect(() => {
    if (!isInitialized) return;

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
  }, [isInitialized]);

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
      critical: notifications.filter(notification => notification.priority === 'critical').length,
      byType: {
        distress: notifications.filter(notification => notification.type === 'distress').length,
        engagement: notifications.filter(notification => notification.type === 'engagement').length,
        system: notifications.filter(notification => notification.type === 'system').length,
        crisis: notifications.filter(notification => notification.type === 'crisis').length
      }
    }
  };
};

export default useRealTimeNotifications;
