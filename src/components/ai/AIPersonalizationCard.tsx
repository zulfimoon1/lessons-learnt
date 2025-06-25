
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, User, TrendingUp, BookOpen, Clock, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { advancedAIService } from '@/services/advancedAIService';

interface AIPersonalizationCardProps {
  studentId: string;
  className?: string;
}

const AIPersonalizationCard: React.FC<AIPersonalizationCardProps> = ({
  studentId,
  className
}) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPersonalizationData();
  }, [studentId]);

  const loadPersonalizationData = async () => {
    try {
      setIsLoading(true);
      console.log('🤖 Loading AI personalization data...');
      
      const [profileData, insightsData] = await Promise.all([
        advancedAIService.generatePersonalizationProfile(studentId),
        advancedAIService.generatePredictiveInsights(studentId, 'week')
      ]);

      setProfile(profileData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading AI personalization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setIsGenerating(true);
      const newInsights = await advancedAIService.generatePredictiveInsights(studentId, 'month');
      setInsights(newInsights);
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'engagement': return <User className="w-4 h-4" />;
      case 'wellbeing': return <Brain className="w-4 h-4" />;
      case 'learning_path': return <BookOpen className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'engagement': return 'bg-green-50 border-green-200 text-green-800';
      case 'wellbeing': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'learning_path': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.personalization') || 'AI Personalization'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.personalization') || 'AI Personalization'}
          </CardTitle>
          <Button
            onClick={refreshInsights}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalized learning insights powered by AI
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Learning Profile Section */}
        {profile && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Learning Profile
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Learning Style</span>
                <Badge variant="secondary" className="ml-2">
                  {profile.learningStyle}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Preferred Difficulty</span>
                <Badge variant="secondary" className="ml-2">
                  {profile.preferredDifficulty}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Best Time</span>
                <Badge variant="outline" className="ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {profile.engagementPatterns.timeOfDay}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Engagement</span>
                <Progress
                  value={Math.min(100, profile.engagementPatterns.feedbackFrequency * 100)}
                  className="mt-1 h-2"
                />
              </div>
            </div>

            {profile.strengths.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">Strengths:</span>
                <div className="flex gap-1 mt-1">
                  {profile.strengths.map((strength: string) => (
                    <Badge key={strength} variant="default" className="text-xs">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.improvementAreas.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Focus Areas:</span>
                <div className="flex gap-1 mt-1">
                  {profile.improvementAreas.map((area: string) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Insights Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Predictions & Recommendations
          </h4>
          
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm capitalize">
                        {insight.type.replace('_', ' ')} Insight
                      </h5>
                      <p className="text-xs mt-1 opacity-90">
                        {insight.prediction}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.timeframe.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {insight.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Recommendations:</p>
                          <ul className="text-xs mt-1 space-y-1">
                            {insight.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                              <li key={idx} className="opacity-90">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                AI insights will appear here as you submit more feedback
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPersonalizationCard;
