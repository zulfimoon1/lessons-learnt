
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, BookOpen, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface TeacherAnalyticsProps {
  teacherId: string;
  school: string;
}

interface TeacherAnalyticsData {
  totalClasses: number;
  totalFeedback: number;
  averageRatings: {
    understanding: number;
    interest: number;
    growth: number;
  };
  responseRate: number;
  subjectPerformance: {
    subject: string;
    avgRating: number;
    totalClasses: number;
    feedbackCount: number;
  }[];
  weeklyTrends: {
    week: string;
    understanding: number;
    interest: number;
    growth: number;
  }[];
  topPerformingClasses: {
    lesson_topic: string;
    subject: string;
    avgRating: number;
    date: string;
  }[];
}

const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsProps> = ({
  teacherId,
  school
}) => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<TeacherAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherAnalytics = async () => {
      try {
        setIsLoading(true);

        // Fetch teacher's classes
        const { data: classesData } = await supabase
          .from('class_schedules')
          .select('*')
          .eq('teacher_id', teacherId);

        // Fetch feedback for teacher's classes
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select(`
            *,
            class_schedules!inner(*)
          `)
          .eq('class_schedules.teacher_id', teacherId);

        if (classesData && feedbackData) {
          // Calculate average ratings
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

          // Calculate response rate
          const responseRate = classesData.length > 0 
            ? (feedbackCount / classesData.length) * 100 
            : 0;

          // Calculate subject performance
          const subjectMap = new Map();
          classesData.forEach(cls => {
            if (!subjectMap.has(cls.subject)) {
              subjectMap.set(cls.subject, {
                subject: cls.subject,
                totalClasses: 0,
                feedbackCount: 0,
                totalRating: 0
              });
            }
            const subject = subjectMap.get(cls.subject);
            subject.totalClasses++;
          });

          feedbackData.forEach(feedback => {
            const subject = subjectMap.get(feedback.class_schedules.subject);
            if (subject) {
              subject.feedbackCount++;
              subject.totalRating += feedback.understanding || 0;
            }
          });

          const subjectPerformance = Array.from(subjectMap.values()).map(subject => ({
            subject: subject.subject,
            avgRating: subject.feedbackCount > 0 ? subject.totalRating / subject.feedbackCount : 0,
            totalClasses: subject.totalClasses,
            feedbackCount: subject.feedbackCount
          }));

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
            const avgGrowth = weekFeedback.length > 0
              ? weekFeedback.reduce((sum, f) => sum + (f.educational_growth || 0), 0) / weekFeedback.length
              : 0;

            return {
              week: `Week ${i + 1}`,
              understanding: Math.round(avgUnderstanding * 10) / 10,
              interest: Math.round(avgInterest * 10) / 10,
              growth: Math.round(avgGrowth * 10) / 10
            };
          });

          // Calculate top performing classes
          const classPerformance = feedbackData.map(feedback => ({
            lesson_topic: feedback.class_schedules.lesson_topic,
            subject: feedback.class_schedules.subject,
            avgRating: (feedback.understanding + feedback.interest + feedback.educational_growth) / 3,
            date: feedback.class_schedules.class_date
          }));

          const topPerformingClasses = classPerformance
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 5);

          setAnalytics({
            totalClasses: classesData.length,
            totalFeedback: feedbackCount,
            averageRatings: {
              understanding: Math.round(avgRatings.understanding * 10) / 10,
              interest: Math.round(avgRatings.interest * 10) / 10,
              growth: Math.round(avgRatings.growth * 10) / 10
            },
            responseRate: Math.round(responseRate * 10) / 10,
            subjectPerformance,
            weeklyTrends,
            topPerformingClasses
          });
        }
      } catch (error) {
        console.error('Error fetching teacher analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherAnalytics();
  }, [teacherId, school]);

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
            {t('analytics.noTeacherData') || 'No analytics data available yet. Create some classes and collect feedback!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalClasses') || 'Total Classes'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.classesCreated') || 'Classes created'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.responseRate') || 'Response Rate'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseRate}%</div>
            <Progress value={analytics.responseRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalFeedback} responses received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.averageRating') || 'Avg Understanding'}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRatings.understanding}/5</div>
            <Badge variant={analytics.averageRatings.understanding >= 4 ? "default" : "secondary"}>
              {analytics.averageRatings.understanding >= 4 ? 
                (t('analytics.excellent') || 'Excellent') : 
                (t('analytics.needsImprovement') || 'Needs Improvement')
              }
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.engagement') || 'Engagement'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRatings.interest}/5</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.averageInterest') || 'Average interest level'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('analytics.performanceTrends') || 'Performance Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="understanding" stroke="#8884d8" name="Understanding" />
              <Line type="monotone" dataKey="interest" stroke="#82ca9d" name="Interest" />
              <Line type="monotone" dataKey="growth" stroke="#ffc658" name="Growth" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('analytics.subjectPerformance') || 'Subject Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {t('analytics.topPerformingClasses') || 'Top Performing Classes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformingClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{cls.lesson_topic}</p>
                    <p className="text-sm text-muted-foreground">{cls.subject}</p>
                  </div>
                  <Badge variant="outline">
                    {Math.round(cls.avgRating * 10) / 10}/5
                  </Badge>
                </div>
              ))}
              {analytics.topPerformingClasses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('analytics.noTopClasses') || 'No class data available yet'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAnalyticsDashboard;
