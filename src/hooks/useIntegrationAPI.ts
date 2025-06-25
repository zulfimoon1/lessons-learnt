
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

interface IntegrationSettings {
  calendar?: {
    provider: 'google' | 'outlook' | 'apple';
    syncEnabled: boolean;
    autoCreateEvents: boolean;
  };
  lms?: {
    provider: 'moodle' | 'canvas' | 'blackboard';
    apiKey: string;
    baseUrl: string;
  };
  notifications?: {
    slack?: { webhookUrl: string };
    teams?: { webhookUrl: string };
    email?: { provider: string; apiKey: string };
  };
}

export const useIntegrationAPI = () => {
  const { teacher, student } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationSettings>({});

  const apiRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'API request failed' };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calendar Integration
  const syncWithCalendar = useCallback(async (provider: 'google' | 'outlook' | 'apple') => {
    const result = await apiRequest('/calendar/sync', {
      method: 'POST',
      body: JSON.stringify({ provider })
    });

    if (result.success) {
      setIntegrations(prev => ({
        ...prev,
        calendar: { ...prev.calendar, provider, syncEnabled: true }
      }));
    }

    return result;
  }, [apiRequest]);

  const createCalendarEvent = useCallback(async (eventData: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    attendees?: string[];
  }) => {
    return await apiRequest('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }, [apiRequest]);

  // LMS Integration
  const connectLMS = useCallback(async (config: {
    provider: 'moodle' | 'canvas' | 'blackboard';
    apiKey: string;
    baseUrl: string;
  }) => {
    const result = await apiRequest('/lms/connect', {
      method: 'POST',
      body: JSON.stringify(config)
    });

    if (result.success) {
      setIntegrations(prev => ({
        ...prev,
        lms: config
      }));
    }

    return result;
  }, [apiRequest]);

  const syncLMSGrades = useCallback(async () => {
    return await apiRequest('/lms/sync-grades', { method: 'POST' });
  }, [apiRequest]);

  const importLMSStudents = useCallback(async (courseId: string) => {
    return await apiRequest(`/lms/import-students/${courseId}`, { method: 'POST' });
  }, [apiRequest]);

  // Webhook Management
  const createWebhook = useCallback(async (config: WebhookConfig) => {
    return await apiRequest('/webhooks', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }, [apiRequest]);

  const updateWebhook = useCallback(async (webhookId: string, config: Partial<WebhookConfig>) => {
    return await apiRequest(`/webhooks/${webhookId}`, {
      method: 'PATCH',
      body: JSON.stringify(config)
    });
  }, [apiRequest]);

  const deleteWebhook = useCallback(async (webhookId: string) => {
    return await apiRequest(`/webhooks/${webhookId}`, { method: 'DELETE' });
  }, [apiRequest]);

  const testWebhook = useCallback(async (webhookId: string) => {
    return await apiRequest(`/webhooks/${webhookId}/test`, { method: 'POST' });
  }, [apiRequest]);

  // Notification Integrations
  const setupSlackNotifications = useCallback(async (webhookUrl: string) => {
    const result = await apiRequest('/notifications/slack', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl })
    });

    if (result.success) {
      setIntegrations(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          slack: { webhookUrl }
        }
      }));
    }

    return result;
  }, [apiRequest]);

  const setupTeamsNotifications = useCallback(async (webhookUrl: string) => {
    const result = await apiRequest('/notifications/teams', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl })
    });

    if (result.success) {
      setIntegrations(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          teams: { webhookUrl }
        }
      }));
    }

    return result;
  }, [apiRequest]);

  // Export Data
  const exportData = useCallback(async (format: 'csv' | 'json' | 'xlsx', filters?: any) => {
    return await apiRequest(`/export?format=${format}`, {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }, [apiRequest]);

  // API Documentation
  const getAPIDocumentation = useCallback(async () => {
    return await apiRequest('/docs');
  }, [apiRequest]);

  const generateAPIKey = useCallback(async (permissions: string[]) => {
    return await apiRequest('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ permissions })
    });
  }, [apiRequest]);

  return {
    loading,
    integrations,
    
    // Calendar
    syncWithCalendar,
    createCalendarEvent,
    
    // LMS
    connectLMS,
    syncLMSGrades,
    importLMSStudents,
    
    // Webhooks
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    
    // Notifications
    setupSlackNotifications,
    setupTeamsNotifications,
    
    // Data & API
    exportData,
    getAPIDocumentation,
    generateAPIKey,
    
    // Generic API
    apiRequest
  };
};

export default useIntegrationAPI;
