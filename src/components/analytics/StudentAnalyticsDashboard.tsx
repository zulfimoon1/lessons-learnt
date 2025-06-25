
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BookOpen, Star, Brain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentAnalyticsDashboardProps {
  studentId: string;
  school: string;
  grade: string;
}

const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  studentId,
  school,
  grade
}) => {
  const { t } = useLanguage();

  // Mock data for demonstration
  const weeklyTrends = [
    { week: t('analytics.week1') || 'Week 1', understanding: 0, interest: 0 },
    { week: t('analytics.week2') || 'Week 2', understanding: 0, interest: 0 },
    { week: t('analytics.week3') || 'Week 3', understanding: 3, interest: 2 },
    { week: t('analytics.week4') || 'Week 4', understanding: 0, interest: 0 }
  ];

  const overallMetrics = {
    understanding: 3,
    interest: 2,
    growth: 5
  };

  return (
    <div className="space-y-6">
      {/* Results Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('analytics.resultsTrends') || 'Results Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyTrends.map((week, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{week.week}</h3>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {t('analytics.understanding') || 'Understanding'}
                      </div>
                      <div className="font-semibold">{week.understanding}/5</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {t('analytics.interest') || 'Interest'}
                      </div>
                      <div className="font-semibold">{week.interest}/5</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            {t('analytics.overallResults') || 'Overall Results'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('analytics.overallUnderstanding') || 'Overall Understanding'}
              </span>
              <div className="flex items-center gap-3">
                <Progress value={(overallMetrics.understanding / 5) * 100} className="w-32" />
                <span className="text-sm font-semibold min-w-[30px]">
                  {overallMetrics.understanding}/5
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('analytics.interestLevel') || 'Interest Level'}
              </span>
              <div className="flex items-center gap-3">
                <Progress value={(overallMetrics.interest / 5) * 100} className="w-32" />
                <span className="text-sm font-semibold min-w-[30px]">
                  {overallMetrics.interest}/5
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('analytics.educationalGrowth') || 'Educational Growth'}
              </span>
              <div className="flex items-center gap-3">
                <Progress value={(overallMetrics.growth / 5) * 100} className="w-32" />
                <span className="text-sm font-semibold min-w-[30px]">
                  {overallMetrics.growth}/5
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalyticsDashboard;
