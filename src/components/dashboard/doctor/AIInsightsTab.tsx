
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainIcon, TrendingUpIcon, AlertTriangleIcon, Users, Target, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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
                <p className="text-2xl font-bold text-purple-600">0</p>
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
                <p className="text-2xl font-bold text-red-600">0</p>
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
                <p className="text-2xl font-bold text-green-600">0</p>
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
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <BrainIcon className="w-5 h-5 text-purple-500" />
            {t('doctor.dashboard.aiInsights')}
            <Badge variant="outline" className="ml-2 border-purple-200 text-purple-800 bg-purple-50">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BrainIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('doctor.dashboard.noInsights')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('doctor.dashboard.noInsightsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsTab;
