
import { useState, useCallback } from 'react';
import { advancedAIService } from '@/services/advancedAIService';

interface UseAdvancedAIOptions {
  autoLoad?: boolean;
}

export const useAdvancedAI = (studentId?: string, options: UseAdvancedAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Personalization Profile
  const [personalizationProfile, setPersonalizationProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Predictive Insights
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  // Content Recommendations
  const [contentRecommendations, setContentRecommendations] = useState<any[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  // Text Analysis
  const [lastTextAnalysis, setLastTextAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generatePersonalizationProfile = useCallback(async (targetStudentId?: string) => {
    const id = targetStudentId || studentId;
    if (!id) {
      setError('Student ID is required');
      return null;
    }

    try {
      setIsProfileLoading(true);
      setError(null);
      console.log('🤖 Generating personalization profile...');
      
      const profile = await advancedAIService.generatePersonalizationProfile(id);
      setPersonalizationProfile(profile);
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate profile';
      setError(errorMessage);
      console.error('Error generating personalization profile:', err);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, [studentId]);

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

  const generateContentRecommendations = useCallback(async (
    subject?: string,
    targetStudentId?: string
  ) => {
    const id = targetStudentId || studentId;
    if (!id) {
      setError('Student ID is required');
      return [];
    }

    try {
      setIsRecommendationsLoading(true);
      setError(null);
      console.log('📚 Generating content recommendations...');
      
      const recommendations = await advancedAIService.generateContentRecommendations(id, subject);
      setContentRecommendations(recommendations);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      console.error('Error generating content recommendations:', err);
      return [];
    } finally {
      setIsRecommendationsLoading(false);
    }
  }, [studentId]);

  const analyzeTextFeedback = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('Text is required for analysis');
      return null;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      console.log('📝 Analyzing text feedback...');
      
      const analysis = await advancedAIService.analyzeTextFeedback(text);
      setLastTextAnalysis(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text';
      setError(errorMessage);
      console.error('Error analyzing text feedback:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

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

      // Generate all AI insights in parallel
      const [profile, insights, recommendations] = await Promise.all([
        advancedAIService.generatePersonalizationProfile(id),
        advancedAIService.generatePredictiveInsights(id, 'month'),
        advancedAIService.generateContentRecommendations(id)
      ]);

      // Update all state
      setPersonalizationProfile(profile);
      setPredictiveInsights(insights);
      setContentRecommendations(recommendations);

      return {
        profile,
        insights,
        recommendations,
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
    setPersonalizationProfile(null);
    setPredictiveInsights([]);
    setContentRecommendations([]);
    setLastTextAnalysis(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    personalizationProfile,
    predictiveInsights,
    contentRecommendations,
    lastTextAnalysis,

    // Loading states
    isProfileLoading,
    isInsightsLoading,
    isRecommendationsLoading,
    isAnalyzing,

    // Actions
    generatePersonalizationProfile,
    generatePredictiveInsights,
    generateContentRecommendations,
    analyzeTextFeedback,
    generateComprehensiveReport,
    clearError,
    clearAllData,

    // Derived state
    hasProfile: !!personalizationProfile,
    hasInsights: predictiveInsights.length > 0,
    hasRecommendations: contentRecommendations.length > 0,
    hasTextAnalysis: !!lastTextAnalysis,
    isAnyLoading: isLoading || isProfileLoading || isInsightsLoading || isRecommendationsLoading || isAnalyzing
  };
};

export default useAdvancedAI;
