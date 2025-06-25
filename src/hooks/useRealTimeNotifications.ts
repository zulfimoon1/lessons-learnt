
import { useState, useEffect, useCallback } from 'react';
import { realTimeNotificationService, RealTimeAlert, NotificationSubscription } from '@/services/realTimeNotificationService';
import { useToast } from './use-toast';

export const useRealTimeNotifications = (
  userId: string, 
  userRole: string, 
  school: string
) => {
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferences, setPreferences] = useState<Partial<NotificationSubscription>>({});
  const { toast } = useToast();

  // Initialize notifications
  useEffect(() => {
    if (!userId || !school || isInitialized) return;

    const initialize = async () => {
      try {
        await realTimeNotificationService.initializeNotifications(userId, userRole, school);
        setIsInitialized(true);
        console.log('🔔 Real-time notifications initialized');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      realTimeNotificationService.cleanup();
    };
  }, [userId, userRole, school, isInitialized]);

  // Listen for real-time alerts
  useEffect(() => {
    const handleRealTimeAlert = (event: CustomEvent) => {
      const { alert, subscription } = event.detail;
      
      // Add to alerts list
      setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts

      // Show toast notification
      toast({
        title: alert.title,
        description: alert.message,
        variant: alert.priority === 'critical' ? 'destructive' : 'default',
        duration: alert.priority === 'critical' ? 0 : 5000, // Critical alerts stay until dismissed
      });

      // Request notification permission if not granted
      if (alert.priority === 'critical' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('realTimeAlert', handleRealTimeAlert);
      return () => window.removeEventListener('realTimeAlert', handleRealTimeAlert);
    }
  }, [toast]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await realTimeNotificationService.acknowledgeAlert(alertId, userId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationSubscription>) => {
    try {
      await realTimeNotificationService.updateNotificationPreferences(userId, {
        ...preferences,
        ...newPreferences
      });
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }, [userId, preferences]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getUnacknowledgedAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.acknowledged);
  }, [alerts]);

  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(alert => alert.priority === 'critical');
  }, [alerts]);

  const getAlertsByType = useCallback((type: string) => {
    return alerts.filter(alert => alert.type === type);
  }, [alerts]);

  // Request notification permission on first critical alert
  useEffect(() => {
    const criticalAlerts = getCriticalAlerts();
    if (criticalAlerts.length > 0 && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      }
    }
  }, [getCriticalAlerts]);

  const notificationStats = {
    total: alerts.length,
    unacknowledged: getUnacknowledgedAlerts().length,
    critical: getCriticalAlerts().length,
    distress: getAlertsByType('distress').length,
    crisis: getAlertsByType('crisis').length
  };

  return {
    alerts,
    isInitialized,
    preferences,
    acknowledgeAlert,
    updatePreferences,
    clearAlert,
    clearAllAlerts,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    getAlertsByType,
    notificationStats
  };
};

export default useRealTimeNotifications;
