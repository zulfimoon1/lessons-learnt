
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainIcon, TrendingUpIcon, AlertTriangleIcon, Users, Target, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  created_at: string;
}

interface AIInsightsTabProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Demo AI insights data
    const demoInsights: AIInsight[] = [
      {
        id: '1',
        type: 'pattern',
        title: 'Emotional Stress Pattern Detected',
        description: 'AI has identified a pattern of increased emotional stress in Grade 10 students over the past 2 weeks. This may be related to upcoming exams.',
        confidence: 87,
        impact: 'high',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'prediction',
        title: 'At-Risk Student Prediction',
        description: '3 students are predicted to need mental health support within the next week based on their feedback patterns and engagement metrics.',
        confidence: 92,
        impact: 'high',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Intervention Recommendation',
        description: 'Recommend implementing group counseling sessions for Grade 9 students showing similar stress indicators.',
        confidence: 78,
        impact: 'medium',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '4',
        type: 'pattern',
        title: 'Language Analysis Insight',
        description: 'Detected increased use of concerning language patterns in weekly summaries. Keywords related to isolation and helplessness are trending upward.',
        confidence: 94,
        impact: 'high',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setTimeout(() => {
      setInsights(demoInsights);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <TrendingUpIcon className="w-4 h-4" />;
      case 'prediction':
        return <Target className="w-4 h-4" />;
      case 'recommendation':
        return <Activity className="w-4 h-4" />;
      default:
        return <BrainIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pattern':
        return 'bg-blue-100 text-blue-800';
      case 'prediction':
        return 'bg-orange-100 text-orange-800';
      case 'recommendation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">{t('doctor.dashboard.loading')}</span>
      </div>
    );
  }

  const highImpactInsights = insights.filter(insight => insight.impact === 'high');
  const avgConfidence = insights.reduce((acc, insight) => acc + insight.confidence, 0) / insights.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BrainIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('doctor.dashboard.aiInsights')}</p>
                <p className="text-2xl font-bold text-purple-600">{insights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Impact</p>
                <p className="text-2xl font-bold text-red-600">{highImpactInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(avgConfidence)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students Analyzed</p>
                <p className="text-2xl font-bold text-blue-600">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights List */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <BrainIcon className="w-5 h-5 text-purple-500" />
            {t('doctor.dashboard.aiInsights')}
            <Badge variant="outline" className="ml-2 border-purple-200 text-purple-800 bg-purple-50">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50/30 to-blue-50/30">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${getTypeColor(insight.type)}`}>
                      {getTypeIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark">{insight.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                          {insight.impact.toUpperCase()} Impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% Confidence
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/50 p-3 rounded border-l-4 border-purple-300">
                  <p className="text-sm text-gray-700">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsTab;
