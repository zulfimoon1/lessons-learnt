
import { useState, useCallback } from 'react';
import { multiLanguageDistressService, DistressAnalysis } from '@/services/multiLanguageDistressService';
import { supabase } from '@/integrations/supabase/client';

export const useDistressDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<DistressAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = useCallback(async (text: string): Promise<DistressAnalysis | null> => {
    if (!text || text.trim().length < 10) {
      return null;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const analysis = multiLanguageDistressService.analyzeText(text);
      setLastAnalysis(analysis);

      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text';
      setError(errorMessage);
      console.error('Error analyzing text for distress:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const saveDistressAlert = useCallback(async (
    studentId: string,
    analysis: DistressAnalysis,
    originalText: string
  ): Promise<boolean> => {
    if (analysis.riskLevel === 'low' && analysis.confidence < 0.5) {
      return false; // Don't save low-confidence, low-risk alerts
    }

    try {
      // Use existing mental_health_alerts table instead of distress_alerts
      const { error } = await supabase
        .from('mental_health_alerts')
        .insert({
          student_id: studentId,
          content: originalText,
          severity_level: analysis.riskLevel === 'critical' ? 5 : 
                         analysis.riskLevel === 'high' ? 4 :
                         analysis.riskLevel === 'medium' ? 3 : 1,
          alert_type: 'distress_detected',
          student_name: 'Student', // Default name
          school: 'Unknown', // Default school
          grade: 'Unknown', // Default grade
          source_table: 'distress_analysis',
          source_id: crypto.randomUUID(), // Generate a source ID
        });

      if (error) {
        console.error('Error saving distress alert:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving distress alert:', err);
      return false;
    }
  }, []);

  const getRecentAlerts = useCallback(async (
    studentId?: string,
    limit: number = 10
  ) => {
    try {
      let query = supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching distress alerts:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching distress alerts:', err);
      return [];
    }
  }, []);

  const analyzeAndSave = useCallback(async (
    text: string,
    studentId: string
  ): Promise<DistressAnalysis | null> => {
    const analysis = await analyzeText(text);
    
    if (analysis && (analysis.riskLevel !== 'low' || analysis.confidence > 0.5)) {
      await saveDistressAlert(studentId, analysis, text);
    }

    return analysis;
  }, [analyzeText, saveDistressAlert]);

  const getCrisisResources = useCallback((language: 'en' | 'lt') => {
    return multiLanguageDistressService.getCrisisResources(language);
  }, []);

  return {
    analyzeText,
    analyzeAndSave,
    saveDistressAlert,
    getRecentAlerts,
    getCrisisResources,
    isAnalyzing,
    lastAnalysis,
    error,
    clearError: () => setError(null)
  };
};

export default useDistressDetection;
