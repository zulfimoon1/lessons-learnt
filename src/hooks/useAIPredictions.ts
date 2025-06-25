
import { useState, useCallback } from 'react';
import { advancedAIService } from '@/services/advancedAIService';

export const useAIPredictions = (studentId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Predictive Insights
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const generatePredictiveInsights = useCallback(async (
    timeframe: 'week' | 'month' | 'semester' = 'week',
    targetStudentId?: string
  ) => {
    const id = targetStudentId || studentId;
    if (!id) {
      setError('Student ID is required');
      return [];
    }

    try {
      setIsInsightsLoading(true);
      setError(null);
      console.log('🔮 Generating predictive insights...');
      
      const insights = await advancedAIService.generatePredictiveInsights(id, timeframe);
      setPredictiveInsights(insights);
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      console.error('Error generating predictive insights:', err);
      return [];
    } finally {
      setIsInsightsLoading(false);
    }
  }, [studentId]);

  const generateComprehensiveReport = useCallback(async (targetStudentId?: string) => {
    const id = targetStudentId || studentId;
    if (!id) {
      setError('Student ID is required');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 Generating comprehensive AI report...');

      const insights = await advancedAIService.generatePredictiveInsights(id, 'month');
      setPredictiveInsights(insights);

      return {
        insights,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate comprehensive report';
      setError(errorMessage);
      console.error('Error generating comprehensive report:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAllData = useCallback(() => {
    setPredictiveInsights([]);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    predictiveInsights,

    // Loading states
    isInsightsLoading,

    // Actions
    generatePredictiveInsights,
    generateComprehensiveReport,
    clearError,
    clearAllData,

    // Derived state
    hasInsights: predictiveInsights.length > 0,
    isAnyLoading: isLoading || isInsightsLoading
  };
};

export default useAIPredictions;
