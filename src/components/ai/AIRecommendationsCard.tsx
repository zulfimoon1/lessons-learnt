
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiRecommendationService } from '@/services/aiRecommendationService';

interface LessonRecommendation {
  subject: string;
  topic: string;
  reason: string;
  confidence: number;
  metadata: {
    previousPerformance?: number;
    relatedTopics?: string[];
    difficulty?: 'basic' | 'intermediate' | 'advanced';
  };
}

interface AIRecommendationsCardProps {
  teacherId: string;
  subject?: string;
}

const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  teacherId,
  subject
}) => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<LessonRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [teacherId, subject]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aiRecommendationService.generateLessonRecommendations(teacherId, subject);
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.recommendations') || 'AI Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Analyzing your teaching data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.recommendations') || 'AI Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('ai.recommendations') || 'AI Recommendations'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Intelligent suggestions based on student feedback patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No specific recommendations at this time. Keep collecting feedback for personalized insights!
              </p>
            </div>
          ) : (
            recommendations.map((recommendation, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{recommendation.topic}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.reason}
                    </p>
                  </div>
                  <Badge variant={getConfidenceColor(recommendation.confidence)}>
                    {Math.round(recommendation.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {recommendation.subject}
                  </Badge>
                  
                  {recommendation.metadata.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recommendation.metadata.difficulty)}`}>
                      {recommendation.metadata.difficulty}
                    </span>
                  )}
                  
                  {recommendation.metadata.previousPerformance && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Avg: {recommendation.metadata.previousPerformance.toFixed(1)}/5
                    </div>
                  )}
                </div>

                {recommendation.metadata.relatedTopics && recommendation.metadata.relatedTopics.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Related: {recommendation.metadata.relatedTopics.join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button onClick={loadRecommendations} variant="outline" className="w-full">
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsCard;
