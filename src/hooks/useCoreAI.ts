
import { useState, useCallback } from 'react';
import { advancedAIService } from '@/services/advancedAIService';

export const useCoreAI = (studentId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text Analysis (moved from useAdvancedAI)
  const [lastTextAnalysis, setLastTextAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setLastTextAnalysis(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    lastTextAnalysis,
    isAnalyzing,

    // Actions
    analyzeTextFeedback,
    clearError,
    clearData,

    // Derived state
    hasTextAnalysis: !!lastTextAnalysis,
    isAnyLoading: isLoading || isAnalyzing
  };
};

export default useCoreAI;
