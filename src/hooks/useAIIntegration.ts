
import { useState, useCallback } from 'react';
import { useDistressDetection } from './useDistressDetection';
import { DistressAnalysis } from '@/services/multiLanguageDistressService';

export interface AIInsight {
  type: 'distress' | 'engagement' | 'academic' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
  studentId?: string;
  timestamp: string;
}

export const useAIIntegration = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { analyzeText } = useDistressDetection();

  const processStudentData = useCallback(async (
    studentId: string,
    feedbackTexts: string[],
    academicData?: any
  ): Promise<AIInsight[]> => {
    setIsProcessing(true);
    const newInsights: AIInsight[] = [];

    try {
      // Process each feedback text for distress
      for (const text of feedbackTexts) {
        if (text.trim().length > 10) {
          const distressAnalysis = await analyzeText(text);
          
          if (distressAnalysis && distressAnalysis.riskLevel !== 'low') {
            newInsights.push({
              type: 'distress',
              severity: distressAnalysis.riskLevel,
              message: `Distress detected in student feedback (${distressAnalysis.confidence * 100}% confidence)`,
              actionRequired: distressAnalysis.riskLevel === 'critical' || distressAnalysis.riskLevel === 'high',
              studentId,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      // Analyze engagement patterns
      if (feedbackTexts.length > 0) {
        const avgLength = feedbackTexts.reduce((sum, text) => sum + text.length, 0) / feedbackTexts.length;
        
        if (avgLength < 20) {
          newInsights.push({
            type: 'engagement',
            severity: 'medium',
            message: 'Student feedback responses are unusually brief, may indicate disengagement',
            actionRequired: false,
            studentId,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Generate recommendations based on patterns
      if (newInsights.some(insight => insight.type === 'distress')) {
        newInsights.push({
          type: 'recommendation',
          severity: 'high',
          message: 'Recommend scheduling a one-on-one check-in with this student',
          actionRequired: true,
          studentId,
          timestamp: new Date().toISOString()
        });
      }

      setInsights(prev => [...prev, ...newInsights]);
      return newInsights;
    } catch (error) {
      console.error('AI integration processing error:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeText]);

  const getInsightsByStudent = useCallback((studentId: string) => {
    return insights.filter(insight => insight.studentId === studentId);
  }, [insights]);

  const getActionableInsights = useCallback(() => {
    return insights.filter(insight => insight.actionRequired);
  }, [insights]);

  const markInsightHandled = useCallback((timestamp: string) => {
    setInsights(prev => prev.filter(insight => insight.timestamp !== timestamp));
  }, []);

  return {
    insights,
    isProcessing,
    processStudentData,
    getInsightsByStudent,
    getActionableInsights,
    markInsightHandled
  };
};

export default useAIIntegration;
