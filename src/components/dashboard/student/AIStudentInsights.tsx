
import React, { useState, useEffect } from 'react';
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
    if (!hasProfile) {
      await generatePersonalizationProfile(studentId);
    }
    if (!hasRecommendations) {
      await generateContentRecommendations(studentId);
    }
    if (!hasInsights) {
      await generatePredictiveInsights(studentId);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold">{t('ai.personalInsights') || 'AI Personal Insights'}</span>
            <div className="text-sm opacity-90">
              {t('ai.poweredByAI') || 'Powered by Advanced AI'}
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
                <div className="text-sm font-medium text-emerald-700">{t('ai.learningProgress') || 'Learning Progress'}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-orange-700">{t('ai.recommendations') || 'Recommendations'}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-700">{t('ai.wellnessInsights') || 'Wellness Insights'}</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsExpanded(true)}
              className="bg-gradient-to-r from-brand-teal to-purple-600 hover:from-brand-teal/90 hover:to-purple-600/90 text-white px-6 py-2 rounded-full transform transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('ai.exploreInsights') || 'Explore Your Insights'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personalization Profile */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-emerald-800">{t('ai.learningProfile') || 'Learning Profile'}</h3>
                {hasProfile && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              {personalizationProfile ? (
                <div className="space-y-2">
                  <p className="text-sm text-emerald-700">{personalizationProfile.learning_style || t('ai.analyzingLearningStyle') || 'Analyzing your learning style...'}</p>
                  <p className="text-sm text-emerald-600">{personalizationProfile.strengths || t('ai.identifyingStrengths') || 'Identifying your strengths...'}</p>
                </div>
              ) : (
                <p className="text-sm text-emerald-600">{t('ai.generateProfilePrompt') || 'Generate your personalized learning profile'}</p>
              )}
            </div>

            {/* Content Recommendations */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-orange-800">{t('ai.smartRecommendations') || 'Smart Recommendations'}</h3>
                {hasRecommendations && <Badge className="bg-orange-100 text-orange-800 border-orange-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              {contentRecommendations ? (
                <div className="space-y-2">
                  {contentRecommendations.slice(0, 2).map((rec: any, index: number) => (
                    <p key={index} className="text-sm text-orange-700">• {rec.title || rec}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-600">{t('ai.generateRecommendationsPrompt') || 'Get personalized study recommendations'}</p>
              )}
            </div>

            {/* Predictive Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">{t('ai.wellnessInsights') || 'Wellness & Growth Insights'}</h3>
                {hasInsights && <Badge className="bg-purple-100 text-purple-800 border-purple-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              {predictiveInsights ? (
                <div className="space-y-2">
                  <p className="text-sm text-purple-700">{predictiveInsights.mental_health_score ? `Wellness Score: ${predictiveInsights.mental_health_score}/10` : t('ai.analyzingWellness') || 'Analyzing your wellness patterns...'}</p>
                  <p className="text-sm text-purple-600">{predictiveInsights.recommendations?.[0] || t('ai.generatingWellnessAdvice') || 'Generating personalized wellness advice...'}</p>
                </div>
              ) : (
                <p className="text-sm text-purple-600">{t('ai.generateInsightsPrompt') || 'Discover insights about your learning journey'}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleGenerateInsights}
                disabled={isAnyLoading}
                className="flex-1 bg-gradient-to-r from-brand-teal to-purple-600 text-white hover:from-brand-teal/90 hover:to-purple-600/90"
              >
                {isAnyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('ai.generating') || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t('ai.generateInsights') || 'Generate AI Insights'}
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('common.minimize') || 'Minimize'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
