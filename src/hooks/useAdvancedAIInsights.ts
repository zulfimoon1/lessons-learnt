
import { useState, useCallback, useEffect } from 'react';
import { advancedAIAnalyticsService, AnalyticsInsight } from '@/services/advancedAIAnalyticsService';
import { realTimeNotificationService } from '@/services/realTimeNotificationService';

export const useAdvancedAIInsights = (school: string, userRole: string) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshInsights = useCallback(async (timeframe: 'week' | 'month' | 'semester' = 'week') => {
    if (!school) return;

    setIsLoading(true);
    setError(null);

    try {
      const newInsights = await advancedAIAnalyticsService.generateInsights(school, timeframe);
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      console.error('Error refreshing AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [school]);

  const getInsightsByType = useCallback((type: string) => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  const getCriticalInsights = useCallback(() => {
    return insights.filter(insight => insight.severity === 'critical');
  }, [insights]);

  const getActionableInsights = useCallback(() => {
    return insights.filter(insight => 
      insight.recommendedActions.length > 0 && 
      (insight.severity === 'warning' || insight.severity === 'critical')
    );
  }, [insights]);

  const markInsightAsRead = useCallback((insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, metadata: { ...insight.metadata, read: true } }
        : insight
    ));
  }, []);

  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  }, []);

  // Auto-refresh insights periodically
  useEffect(() => {
    if (!school) return;

    // Initial load
    refreshInsights();

    // Set up periodic refresh (every 30 minutes)
    const interval = setInterval(() => {
      refreshInsights();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [school, refreshInsights]);

  // Listen for real-time alerts that might trigger new insights
  useEffect(() => {
    const handleRealTimeAlert = () => {
      // Debounce refresh to avoid too frequent updates
      setTimeout(() => {
        refreshInsights();
      }, 5000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('realTimeAlert', handleRealTimeAlert);
      return () => window.removeEventListener('realTimeAlert', handleRealTimeAlert);
    }
  }, [refreshInsights]);

  const getInsightsSummary = useCallback(() => {
    const summary = {
      total: insights.length,
      critical: insights.filter(i => i.severity === 'critical').length,
      warning: insights.filter(i => i.severity === 'warning').length,
      trends: insights.filter(i => i.type === 'trend').length,
      patterns: insights.filter(i => i.type === 'pattern').length,
      predictions: insights.filter(i => i.type === 'prediction').length,
      actionable: getActionableInsights().length,
      unread: insights.filter(i => !i.metadata?.read).length
    };

    return summary;
  }, [insights, getActionableInsights]);

  return {
    insights,
    isLoading,
    error,
    lastUpdated,
    refreshInsights,
    getInsightsByType,
    getCriticalInsights,
    getActionableInsights,
    markInsightAsRead,
    dismissInsight,
    getInsightsSummary
  };
};

export default useAdvancedAIInsights;
