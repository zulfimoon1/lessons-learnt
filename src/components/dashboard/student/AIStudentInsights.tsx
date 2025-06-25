
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

  // Mock data for demonstration
  const insights = [
    {
      icon: TrendingUp,
      title: t('ai.insights.exploreLearningMethods') || 'Explore New Learning Methods',
      description: t('ai.insights.tryDifferentTechniques') || 'Try different study techniques or ask your teacher about more engaging activities.',
      progress: 40,
      status: 'improving'
    },
    {
      icon: Users,
      title: t('ai.insights.increaseParticipation') || 'Increase Participation', 
      description: t('ai.insights.regularFeedbackHelps') || 'Regular feedback helps both you and your teachers understand your learning needs better.',
      progress: 60,
      status: 'declining'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {t('ai.insights.title') || 'AI Personal Insights'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('ai.insights.personalizedInsights') || 'Personalized insights about your learning journey'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <Progress 
                    value={insight.progress} 
                    className="h-2"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {insight.progress === 60 && insight.status === 'declining' 
                    ? (t('ai.insights.declining') || 'Declining')
                    : `${insight.progress}/5`
                  }
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
