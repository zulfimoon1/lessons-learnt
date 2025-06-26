
import { useState, useCallback } from 'react';
import { enhancedThreatDetectionService } from '@/services/enhancedThreatDetectionService';

export interface EnhancedThreatAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedPatterns: string[];
  culturalFactors: string[];
  interventionRecommendations: string[];
  requiresImmediateAction: boolean;
  predictiveRiskScore: number;
  semanticAnalysis: {
    sentiment: number;
    emotion: string;
    tone: string;
    urgency: number;
  };
}

export const useEnhancedThreatDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<EnhancedThreatAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = useCallback(async (
    text: string,
    studentId: string,
    metadata?: {
      timestamp?: Date;
      typingSpeed?: number;
      deletionCount?: number;
      pauseDuration?: number;
    }
  ): Promise<EnhancedThreatAnalysis | null> => {
    if (!text || text.trim().length < 5) {
      return null;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const analysis = await enhancedThreatDetectionService.analyzeText(text, studentId, metadata);
      setLastAnalysis(analysis);

      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text for threats';
      setError(errorMessage);
      console.error('Error in enhanced threat detection:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getStudentRiskTrends = useCallback(async (studentId: string, days: number = 30) => {
    try {
      setError(null);
      return await enhancedThreatDetectionService.getStudentRiskTrends(studentId, days);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get risk trends';
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    analyzeText,
    getStudentRiskTrends,
    isAnalyzing,
    lastAnalysis,
    error,
    clearError: () => setError(null)
  };
};

export default useEnhancedThreatDetection;
