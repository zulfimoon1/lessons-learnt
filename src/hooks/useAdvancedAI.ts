
import { useCoreAI } from './useCoreAI';
import { useAIPersonalization } from './useAIPersonalization';
import { useAIPredictions } from './useAIPredictions';

interface UseAdvancedAIOptions {
  autoLoad?: boolean;
}

export const useAdvancedAI = (studentId?: string, options: UseAdvancedAIOptions = {}) => {
  const coreAI = useCoreAI(studentId);
  const personalizationAI = useAIPersonalization(studentId);
  const predictionsAI = useAIPredictions(studentId);

  // Aggregate all loading states
  const isAnyLoading = 
    coreAI.isAnyLoading || 
    personalizationAI.isAnyLoading || 
    predictionsAI.isAnyLoading;

  // Aggregate all errors
  const error = coreAI.error || personalizationAI.error || predictionsAI.error;

  const clearError = () => {
    coreAI.clearError();
    personalizationAI.clearError();
    predictionsAI.clearError();
  };

  const clearAllData = () => {
    coreAI.clearData();
    personalizationAI.clearAllData();
    predictionsAI.clearAllData();
  };

  return {
    // Core AI functionality
    ...coreAI,
    
    // Personalization functionality
    personalizationProfile: personalizationAI.personalizationProfile,
    contentRecommendations: personalizationAI.contentRecommendations,
    generatePersonalizationProfile: personalizationAI.generatePersonalizationProfile,
    generateContentRecommendations: personalizationAI.generateContentRecommendations,
    isProfileLoading: personalizationAI.isProfileLoading,
    isRecommendationsLoading: personalizationAI.isRecommendationsLoading,

    // Predictions functionality
    predictiveInsights: predictionsAI.predictiveInsights,
    generatePredictiveInsights: predictionsAI.generatePredictiveInsights,
    generateComprehensiveReport: predictionsAI.generateComprehensiveReport,
    isInsightsLoading: predictionsAI.isInsightsLoading,

    // Aggregated state
    error,
    isAnyLoading,
    clearError,
    clearAllData,

    // Derived state
    hasProfile: personalizationAI.hasProfile,
    hasInsights: predictionsAI.hasInsights,
    hasRecommendations: personalizationAI.hasRecommendations,
    hasTextAnalysis: coreAI.hasTextAnalysis
  };
};

export default useAdvancedAI;
