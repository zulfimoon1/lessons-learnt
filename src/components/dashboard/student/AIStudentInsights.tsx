
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, BookOpen, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface StudentInsight {
  type: 'strength' | 'improvement' | 'trend';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface AIStudentInsightsProps {
  studentId: string;
  school: string;
  grade: string;
}

const AIStudentInsights: React.FC<AIStudentInsightsProps> = ({
  studentId,
  school,
  grade
}) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<StudentInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [studentId]);

  const generateInsights = async () => {
    try {
      setIsLoading(true);
      
      // Get student's recent feedback
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules(subject, lesson_topic)
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (!feedbackData || feedbackData.length === 0) {
        setInsights([
          {
            type: 'improvement',
            title: 'Start Your Learning Journey',
            description: 'Submit feedback for your classes to unlock personalized AI insights about your learning progress!'
          }
        ]);
        return;
      }

      const generatedInsights: StudentInsight[] = [];

      // Analyze understanding trends
      const avgUnderstanding = feedbackData.reduce((sum, f) => sum + (f.understanding || 0), 0) / feedbackData.length;
      const recentUnderstanding = feedbackData.slice(0, 5).reduce((sum, f) => sum + (f.understanding || 0), 0) / Math.min(5, feedbackData.length);
      
      if (avgUnderstanding >= 4) {
        generatedInsights.push({
          type: 'strength',
          title: 'Strong Academic Performance',
          description: `Your average understanding score is ${avgUnderstanding.toFixed(1)}/5. You're grasping concepts well!`,
          value: avgUnderstanding,
          trend: recentUnderstanding > avgUnderstanding ? 'up' : recentUnderstanding < avgUnderstanding ? 'down' : 'stable'
        });
      } else if (avgUnderstanding < 3) {
        generatedInsights.push({
          type: 'improvement',
          title: 'Focus on Understanding',
          description: `Your understanding scores suggest you might benefit from additional support or different learning approaches.`,
          value: avgUnderstanding
        });
      }

      // Analyze interest levels
      const avgInterest = feedbackData.reduce((sum, f) => sum + (f.interest || 0), 0) / feedbackData.length;
      if (avgInterest >= 4) {
        generatedInsights.push({
          type: 'strength',
          title: 'High Engagement Level',
          description: `You show strong interest in your subjects with an average score of ${avgInterest.toFixed(1)}/5.`,
          value: avgInterest
        });
      } else if (avgInterest < 3) {
        generatedInsights.push({
          type: 'improvement',
          title: 'Explore New Learning Methods',
          description: 'Try different study techniques or ask your teacher about more engaging activities.',
          value: avgInterest
        });
      }

      // Subject analysis
      const subjectMap = new Map();
      feedbackData.forEach(feedback => {
        const subject = feedback.class_schedules?.subject;
        if (subject) {
          if (!subjectMap.has(subject)) {
            subjectMap.set(subject, { understanding: [], interest: [] });
          }
          subjectMap.get(subject).understanding.push(feedback.understanding || 0);
          subjectMap.get(subject).interest.push(feedback.interest || 0);
        }
      });

      // Find strongest subject
      let strongestSubject = '';
      let highestScore = 0;
      for (const [subject, scores] of subjectMap.entries()) {
        const avgScore = (scores.understanding.reduce((a: number, b: number) => a + b, 0) / scores.understanding.length +
                         scores.interest.reduce((a: number, b: number) => a + b, 0) / scores.interest.length) / 2;
        if (avgScore > highestScore) {
          highestScore = avgScore;
          strongestSubject = subject;
        }
      }

      if (strongestSubject && highestScore >= 3.5) {
        generatedInsights.push({
          type: 'strength',
          title: `Excelling in ${strongestSubject}`,
          description: `${strongestSubject} appears to be your strongest subject. Consider exploring advanced topics!`,
          value: highestScore
        });
      }

      // Participation trend
      const participationRate = feedbackData.length >= 10 ? 'high' : feedbackData.length >= 5 ? 'moderate' : 'low';
      if (participationRate === 'high') {
        generatedInsights.push({
          type: 'strength',
          title: 'Active Participation',
          description: 'You consistently provide feedback, which shows great engagement with your learning process.',
          trend: 'up'
        });
      } else if (participationRate === 'low') {
        generatedInsights.push({
          type: 'improvement',
          title: 'Increase Participation',
          description: 'Regular feedback helps both you and your teachers understand your learning needs better.',
          trend: 'down'
        });
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating student insights:', error);
      setInsights([
        {
          type: 'improvement',
          title: 'Insights Unavailable',
          description: 'Unable to generate insights at this time. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Target className="w-5 h-5 text-green-600" />;
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'trend': return <BookOpen className="w-5 h-5 text-purple-600" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-green-50 border-green-200';
      case 'improvement': return 'bg-blue-50 border-blue-200';
      case 'trend': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.personalInsights') || 'AI Personal Insights'}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('ai.personalInsights') || 'AI Personal Insights'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized insights about your learning journey
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  
                  {insight.value && (
                    <div className="flex items-center gap-2">
                      <Progress value={(insight.value / 5) * 100} className="flex-1 h-2" />
                      <span className="text-sm font-medium">
                        {insight.value.toFixed(1)}/5
                      </span>
                    </div>
                  )}
                  
                  {insight.trend && (
                    <Badge variant="outline" className="mt-2">
                      {insight.trend === 'up' ? '↗ Improving' : 
                       insight.trend === 'down' ? '↘ Declining' : 
                       '→ Stable'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
