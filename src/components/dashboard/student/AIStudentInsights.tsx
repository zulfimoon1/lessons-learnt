
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
    hasInsights,
    error
  } = useAdvancedAI(studentId);

  console.log('AIStudentInsights: Component render with state:', { 
    isExpanded, 
    hasProfile, 
    hasRecommendations, 
    hasInsights, 
    isAnyLoading,
    error,
    studentId,
    personalizationProfile: !!personalizationProfile,
    contentRecommendations: !!contentRecommendations,
    predictiveInsights: !!predictiveInsights
  });

  const handleGenerateInsights = async () => {
    console.log('AIStudentInsights: Starting AI insight generation process...');
    try {
      if (!hasProfile) {
        console.log('AIStudentInsights: Generating personalization profile...');
        await generatePersonalizationProfile(studentId);
      }
      if (!hasRecommendations) {
        console.log('AIStudentInsights: Generating content recommendations...');
        await generateContentRecommendations(studentId);
      }
      if (!hasInsights) {
        console.log('AIStudentInsights: Generating predictive insights...');
        await generatePredictiveInsights("month");
      }
      console.log('AIStudentInsights: AI generation process completed successfully');
    } catch (error) {
      console.error('AIStudentInsights: Error during AI generation:', error);
    }
  };

  const handleExploreInsights = () => {
    console.log('AIStudentInsights: User clicked Explore Insights, expanding view');
    setIsExpanded(true);
    if (!hasProfile || !hasRecommendations || !hasInsights) {
      console.log('AIStudentInsights: Auto-generating missing insights...');
      handleGenerateInsights();
    }
  };

  // Helper function to safely access predictive insights data
  const getPredictiveInsightsData = () => {
    if (!predictiveInsights) return null;
    const data = Array.isArray(predictiveInsights) ? predictiveInsights[0] : predictiveInsights;
    return data;
  };

  // Helper function to safely render content recommendations
  const renderContentRecommendations = () => {
    if (!contentRecommendations || contentRecommendations.length === 0) {
      return (
        <>
          <p className="text-sm text-gray-800 font-medium">• Cool activities that match how you like to learn</p>
          <p className="text-sm text-gray-800 font-medium">• Fun projects you might really enjoy</p>
        </>
      );
    }

    return contentRecommendations.slice(0, 2).map((rec: any, index: number) => (
      <p key={index} className="text-sm text-gray-800 font-medium">
        • {typeof rec === 'string' ? rec : (rec.title || rec.topic || 'Something cool just for you!')}
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
            <span className="text-lg font-bold">My Learning Helper</span>
            <div className="text-sm opacity-90">
              Cool insights about how you learn!
            </div>
          </div>
          <Sparkles className="w-5 h-5 ml-auto text-yellow-300" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
            <p className="text-sm text-red-800 font-medium">Learning Helper isn't working right now</p>
            <p className="text-xs text-red-700">{error}</p>
            <Button 
              onClick={handleGenerateInsights}
              size="sm"
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!isExpanded ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-emerald-700">How I'm Getting Better</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-orange-700">Fun Things To Try</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-700">How I'm Feeling</div>
              </div>
            </div>
            
            <Button 
              onClick={handleExploreInsights}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-full transform transition-all hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              See What's Cool About How I Learn!
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Learning Profile */}
            <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">How I Learn Best</h3>
                {hasProfile && <Badge className="bg-green-100 text-green-800 border-green-300">Ready!</Badge>}
                {isAnyLoading && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Finding out...</Badge>}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-800 font-medium">
                  {personalizationProfile?.learning_style || 'You learn really well when you can see things and work with others!'}
                </p>
                <p className="text-sm text-gray-700">
                  {personalizationProfile?.strengths || 'You\'re great at paying attention to details and solving problems in creative ways'}
                </p>
              </div>
            </div>

            {/* Content Recommendations */}
            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-orange-900">Fun Things To Try</h3>
                {hasRecommendations && <Badge className="bg-green-100 text-green-800 border-green-300">Ready!</Badge>}
                {isAnyLoading && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Finding ideas...</Badge>}
              </div>
              <div className="space-y-2">
                {renderContentRecommendations()}
              </div>
            </div>

            {/* Wellness Insights */}
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">How I'm Feeling Lately</h3>
                {hasInsights && <Badge className="bg-green-100 text-green-800 border-green-300">Ready!</Badge>}
                {isAnyLoading && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Checking in...</Badge>}
              </div>
              <div className="space-y-2">
                {(() => {
                  const data = getPredictiveInsightsData();
                  return (
                    <>
                      <p className="text-sm text-gray-800 font-medium">
                        {data?.mental_health_score 
                          ? `How You're Doing: ${data.mental_health_score}/10 - You're doing awesome!`
                          : 'How You\'re Doing: 8.5/10 - You\'re keeping a great balance!'
                        }
                      </p>
                      <p className="text-sm text-gray-700">
                        {data?.recommendations?.[0] || 'Keep up your positive attitude and remember to take breaks when you need them'}
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
                    Finding new insights...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Get New Insights
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md"
              >
                Make Smaller
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
