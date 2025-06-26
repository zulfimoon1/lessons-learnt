
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, BookOpen, Heart, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import useAdvancedAI from '@/hooks/useAdvancedAI';

interface AIStudentInsightsProps {
  studentId: string;
  school: string;
  grade: string;
}

const AIStudentInsights: React.FC<AIStudentInsightsProps> = ({ studentId, school, grade }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    personalizationProfile, 
    contentRecommendations, 
    predictiveInsights,
    generatePersonalizationProfile,
    generateContentRecommendations,
    generatePredictiveInsights,
    isAnyLoading,
    hasProfile,
    hasRecommendations,
    hasInsights
  } = useAdvancedAI(studentId);

  const handleGenerateInsights = async () => {
    try {
      if (!hasProfile) {
        await generatePersonalizationProfile(studentId);
      }
      if (!hasRecommendations) {
        await generateContentRecommendations(studentId);
      }
      if (!hasInsights) {
        await generatePredictiveInsights("month");
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  // Helper function to safely access predictive insights data
  const getPredictiveInsightsData = () => {
    if (!predictiveInsights) return null;
    
    // Handle both array and object formats
    const data = Array.isArray(predictiveInsights) ? predictiveInsights[0] : predictiveInsights;
    return data;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-300/60 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold">{t('ai.personalInsights')}</span>
            <div className="text-sm opacity-90">
              {t('ai.poweredByAI')}
            </div>
          </div>
          <Sparkles className="w-5 h-5 ml-auto text-yellow-300" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!isExpanded ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-emerald-700">{t('ai.learningProgress')}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-orange-700">{t('ai.recommendations')}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-700">{t('ai.wellnessInsights')}</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-full transform transition-all hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('ai.exploreInsights')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personalization Profile - Enhanced Contrast */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-500 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">{t('ai.learningProfile')}</h3>
                {hasProfile && <Badge className="bg-blue-200 text-blue-900 border-blue-400">{t('common.ready')}</Badge>}
              </div>
              {personalizationProfile ? (
                <div className="space-y-2">
                  <p className="text-sm text-blue-800">{personalizationProfile.learning_style || t('ai.analyzingLearningStyle')}</p>
                  <p className="text-sm text-blue-700">{personalizationProfile.strengths || t('ai.identifyingStrengths')}</p>
                </div>
              ) : (
                <p className="text-sm text-blue-700">{t('ai.generateProfilePrompt')}</p>
              )}
            </div>

            {/* Content Recommendations - Enhanced Contrast */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-500 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-700 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-orange-900">{t('ai.smartRecommendations')}</h3>
                {hasRecommendations && <Badge className="bg-orange-200 text-orange-900 border-orange-400">{t('common.ready')}</Badge>}
              </div>
              {contentRecommendations ? (
                <div className="space-y-2">
                  {contentRecommendations.slice(0, 2).map((rec: any, index: number) => (
                    <p key={index} className="text-sm text-orange-800">• {rec.title || rec}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-700">{t('ai.generateRecommendationsPrompt')}</p>
              )}
            </div>

            {/* Predictive Insights - Enhanced Contrast */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">{t('ai.wellnessInsights')}</h3>
                {hasInsights && <Badge className="bg-purple-200 text-purple-900 border-purple-400">{t('common.ready')}</Badge>}
              </div>
              {predictiveInsights ? (
                <div className="space-y-2">
                  {(() => {
                    const data = getPredictiveInsightsData();
                    return (
                      <>
                        <p className="text-sm text-purple-800">
                          {data?.mental_health_score 
                            ? `Wellness Score: ${data.mental_health_score}/10`
                            : t('ai.analyzingWellness')
                          }
                        </p>
                        <p className="text-sm text-purple-700">
                          {data?.recommendations?.[0] || t('ai.generatingWellnessAdvice')}
                        </p>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-purple-700">{t('ai.generateInsightsPrompt')}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleGenerateInsights}
                disabled={isAnyLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700 shadow-lg"
              >
                {isAnyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('ai.generating')}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t('ai.generateInsights')}
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md"
              >
                {t('common.minimize')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
