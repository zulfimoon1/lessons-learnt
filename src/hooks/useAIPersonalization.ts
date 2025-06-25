
import { useState, useCallback } from 'react';
import { advancedAIService } from '@/services/advancedAIService';

export const useAIPersonalization = (studentId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Personalization Profile
  const [personalizationProfile, setPersonalizationProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Content Recommendations
  const [contentRecommendations, setContentRecommendations] = useState<any[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAllData = useCallback(() => {
    setPersonalizationProfile(null);
    setContentRecommendations([]);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    personalizationProfile,
    contentRecommendations,

    // Loading states
    isProfileLoading,
    isRecommendationsLoading,

    // Actions
    generatePersonalizationProfile,
    generateContentRecommendations,
    clearError,
    clearAllData,

    // Derived state
    hasProfile: !!personalizationProfile,
    hasRecommendations: contentRecommendations.length > 0,
    isAnyLoading: isLoading || isProfileLoading || isRecommendationsLoading
  };
};

export default useAIPersonalization;
