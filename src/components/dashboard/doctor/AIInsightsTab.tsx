
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainIcon, TrendingUpIcon, AlertTriangleIcon, Users, Target, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdvancedAIInsights } from "@/hooks/useAdvancedAIInsights";

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
  const [studentsAnalyzed, setStudentsAnalyzed] = useState(0);
  
  const {
    insights,
    isLoading,
    error,
    lastUpdated,
    refreshInsights,
    getInsightsSummary
  } = useAdvancedAIInsights(teacher.school, teacher.role);

  useEffect(() => {
    fetchStudentCount();
  }, [teacher.school]);

  const fetchStudentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school', teacher.school);

      if (!error && count !== null) {
        setStudentsAnalyzed(count);
      }
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
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
      case 'trend':
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
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
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

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{t('doctor.dashboard.insightsError')}</p>
        <button 
          onClick={() => refreshInsights()}
          className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal/90"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const summary = getInsightsSummary();

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
                <p className="text-2xl font-bold text-purple-600">{summary.total}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.criticalInsights')}</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.actionableInsights')}</p>
                <p className="text-2xl font-bold text-green-600">{summary.actionable}</p>
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
                <p className="text-sm text-gray-600">{t('doctor.dashboard.studentsAnalyzed')}</p>
                <p className="text-2xl font-bold text-blue-600">{studentsAnalyzed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights List */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-brand-dark">
              <BrainIcon className="w-5 h-5 text-purple-500" />
              {t('doctor.dashboard.aiInsights')}
              <Badge variant="outline" className="ml-2 border-purple-200 text-purple-800 bg-purple-50">
                AI-Powered
              </Badge>
            </CardTitle>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                {t('doctor.dashboard.lastUpdated')}: {lastUpdated.toLocaleString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <BrainIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('doctor.dashboard.noInsights')}</p>
              <p className="text-sm text-gray-500 mt-2">
                {t('doctor.dashboard.noInsightsDescription')}
              </p>
              <button 
                onClick={() => refreshInsights()}
                className="mt-4 px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal/90"
              >
                {t('doctor.dashboard.generateInsights')}
              </button>
            </div>
          ) : (
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
                          <Badge variant={getImpactColor(insight.severity)} className="text-xs">
                            {insight.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% {t('doctor.dashboard.confidence')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(insight.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 p-3 rounded border-l-4 border-purple-300">
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    {insight.recommendedActions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t('doctor.dashboard.recommendedActions')}:
                        </p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {insight.recommendedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsTab;
