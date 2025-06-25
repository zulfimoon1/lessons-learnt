
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, BookOpen, Heart, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface StudentAnalyticsProps {
  studentId: string;
  school: string;
  grade: string;
}

interface AnalyticsData {
  totalClasses: number;
  feedbackSubmitted: number;
  averageRatings: {
    understanding: number;
    interest: number;
    growth: number;
  };
  recentTrends: {
    week: string;
    understanding: number;
    interest: number;
  }[];
  wellnessEntries: number;
}

const StudentAnalyticsDashboard: React.FC<StudentAnalyticsProps> = ({
  studentId,
  school,
  grade
}) => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch student's feedback data
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select(`
            *,
            class_schedules(*)
          `)
          .eq('student_id', studentId);

        // Fetch upcoming classes for the student's grade
        const { data: classesData } = await supabase
          .from('class_schedules')
          .select('*')
          .eq('school', school)
          .eq('grade', grade);

        if (feedbackData && classesData) {
          const avgRatings = feedbackData.reduce(
            (acc, feedback) => {
              acc.understanding += feedback.understanding || 0;
              acc.interest += feedback.interest || 0;
              acc.growth += feedback.educational_growth || 0;
              return acc;
            },
            { understanding: 0, interest: 0, growth: 0 }
          );

          const feedbackCount = feedbackData.length;
          if (feedbackCount > 0) {
            avgRatings.understanding /= feedbackCount;
            avgRatings.interest /= feedbackCount;
            avgRatings.growth /= feedbackCount;
          }

          // Calculate weekly trends (last 4 weeks)
          const fourWeeksAgo = new Date();
          fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
          
          const recentFeedback = feedbackData.filter(f => 
            new Date(f.submitted_at) >= fourWeeksAgo
          );

          const weeklyTrends = Array.from({ length: 4 }, (_, i) => {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            const weekFeedback = recentFeedback.filter(f => {
              const date = new Date(f.submitted_at);
              return date >= weekStart && date < weekEnd;
            });

            const avgUnderstanding = weekFeedback.length > 0 
              ? weekFeedback.reduce((sum, f) => sum + (f.understanding || 0), 0) / weekFeedback.length
              : 0;
            const avgInterest = weekFeedback.length > 0
              ? weekFeedback.reduce((sum, f) => sum + (f.interest || 0), 0) / weekFeedback.length
              : 0;

            return {
              week: `Week ${i + 1}`,
              understanding: Math.round(avgUnderstanding * 10) / 10,
              interest: Math.round(avgInterest * 10) / 10
            };
          });

          setAnalytics({
            totalClasses: classesData.length,
            feedbackSubmitted: feedbackData.length,
            averageRatings: {
              understanding: Math.round(avgRatings.understanding * 10) / 10,
              interest: Math.round(avgRatings.interest * 10) / 10,
              growth: Math.round(avgRatings.growth * 10) / 10
            },
            recentTrends: weeklyTrends,
            wellnessEntries: 0 // Would be implemented when wellness data is stored
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [studentId, school, grade]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t('analytics.noData') || 'No analytics data available yet. Complete some classes to see your progress!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = analytics.totalClasses > 0 
    ? (analytics.feedbackSubmitted / analytics.totalClasses) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalClasses') || 'Total Classes'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.classesAvailable') || 'Classes available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.feedbackSubmitted') || 'Feedback Submitted'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.feedbackSubmitted}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progressPercentage)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.averageUnderstanding') || 'Avg Understanding'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRatings.understanding}/5</div>
            <Badge variant={analytics.averageRatings.understanding >= 4 ? "default" : "secondary"}>
              {analytics.averageRatings.understanding >= 4 ? 
                (t('analytics.excellent') || 'Excellent') : 
                (t('analytics.improving') || 'Improving')
              }
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.wellnessChecks') || 'Wellness Checks'}
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.wellnessEntries}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.thisMonth') || 'This month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('analytics.performanceTrends') || 'Performance Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{trend.week}</span>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Understanding</p>
                    <p className="font-semibold">{trend.understanding}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Interest</p>
                    <p className="font-semibold">{trend.interest}/5</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('analytics.subjectPerformance') || 'Subject Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Understanding</span>
              <div className="flex items-center gap-2">
                <Progress value={(analytics.averageRatings.understanding / 5) * 100} className="w-20" />
                <span className="text-sm font-medium">{analytics.averageRatings.understanding}/5</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest Level</span>
              <div className="flex items-center gap-2">
                <Progress value={(analytics.averageRatings.interest / 5) * 100} className="w-20" />
                <span className="text-sm font-medium">{analytics.averageRatings.interest}/5</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Educational Growth</span>
              <div className="flex items-center gap-2">
                <Progress value={(analytics.averageRatings.growth / 5) * 100} className="w-20" />
                <span className="text-sm font-medium">{analytics.averageRatings.growth}/5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalyticsDashboard;
