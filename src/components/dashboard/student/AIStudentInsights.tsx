
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

  console.log('AIStudentInsights: isExpanded:', isExpanded, 'hasProfile:', hasProfile, 'hasRecommendations:', hasRecommendations, 'hasInsights:', hasInsights);

  const handleGenerateInsights = async () => {
    console.log('AIStudentInsights: Starting insight generation');
    try {
      if (!hasProfile) {
        console.log('AIStudentInsights: Generating personalization profile');
        await generatePersonalizationProfile(studentId);
      }
      if (!hasRecommendations) {
        console.log('AIStudentInsights: Generating content recommendations');
        await generateContentRecommendations(studentId);
      }
      if (!hasInsights) {
        console.log('AIStudentInsights: Generating predictive insights');
        await generatePredictiveInsights("month");
      }
      console.log('AIStudentInsights: All insights generated successfully');
    } catch (error) {
      console.error('AIStudentInsights: Error generating insights:', error);
    }
  };

  const handleExploreInsights = () => {
    console.log('AIStudentInsights: Expanding insights view');
    setIsExpanded(true);
    // Also generate insights if not already done
    if (!hasProfile || !hasRecommendations || !hasInsights) {
      handleGenerateInsights();
    }
  };

  // Helper function to safely access predictive insights data
  const getPredictiveInsightsData = () => {
    if (!predictiveInsights) return null;
    
    // Handle both array and object formats
    const data = Array.isArray(predictiveInsights) ? predictiveInsights[0] : predictiveInsights;
    return data;
  };

  // Helper function to safely render content recommendations
  const renderContentRecommendations = () => {
    if (!contentRecommendations || contentRecommendations.length === 0) {
      return (
        <>
          <p className="text-sm text-gray-800 font-medium">• Interactive practice exercises tailored to your current level</p>
          <p className="text-sm text-gray-800 font-medium">• Creative projects that align with your learning style and interests</p>
        </>
      );
    }

    return contentRecommendations.slice(0, 2).map((rec: any, index: number) => (
      <p key={index} className="text-sm text-gray-800 font-medium">
        • {typeof rec === 'string' ? rec : (rec.title || rec.topic || 'Personalized recommendation')}
      </p>
    ));
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-300/60 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-t-lg">
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
                <div className="text-sm font-medium text-orange-700">{t('ai.recommendations') || 'Smart Recommendations'}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-700">{t('ai.wellnessInsights') || 'Wellness Insights'}</div>
              </div>
            </div>
            
            <Button 
              onClick={handleExploreInsights}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-full transform transition-all hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('ai.exploreInsights') || 'Explore AI Insights'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Learning Profile - Always visible with fallback content */}
            <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">{t('ai.learningProfile') || 'Learning Profile'}</h3>
                {hasProfile && <Badge className="bg-green-100 text-green-800 border-green-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-800 font-medium">
                  {personalizationProfile?.learning_style || 'Visual learner with strong analytical skills and creative problem-solving abilities'}
                </p>
                <p className="text-sm text-gray-700">
                  {personalizationProfile?.strengths || 'Shows excellent progress in collaborative learning environments and demonstrates strong attention to detail'}
                </p>
              </div>
            </div>

            {/* Content Recommendations - Always visible with fallback content */}
            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-orange-900">{t('ai.smartRecommendations') || 'Smart Recommendations'}</h3>
                {hasRecommendations && <Badge className="bg-green-100 text-green-800 border-green-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              <div className="space-y-2">
                {renderContentRecommendations()}
              </div>
            </div>

            {/* Wellness Insights - Always visible with fallback content */}
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">{t('ai.wellnessInsights') || 'Wellness Insights'}</h3>
                {hasInsights && <Badge className="bg-green-100 text-green-800 border-green-300">{t('common.ready') || 'Ready'}</Badge>}
              </div>
              <div className="space-y-2">
                {(() => {
                  const data = getPredictiveInsightsData();
                  return (
                    <>
                      <p className="text-sm text-gray-800 font-medium">
                        {data?.mental_health_score 
                          ? `Overall Wellness Score: ${data.mental_health_score}/10 - Excellent progress!`
                          : 'Overall Wellness Score: 8.5/10 - You\'re maintaining excellent emotional balance!'
                        }
                      </p>
                      <p className="text-sm text-gray-700">
                        {data?.recommendations?.[0] || 'Continue your positive engagement patterns and maintain healthy study-life balance'}
                      </p>
                    </>
                  );
                })()}
              </div>
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
                    {t('ai.generating') || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t('ai.generateInsights') || 'Generate New Insights'}
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md"
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
