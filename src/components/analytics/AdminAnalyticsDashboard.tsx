
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { School, Users, BookOpen, TrendingUp, AlertTriangle, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminAnalyticsProps {
  school: string;
}

interface AdminAnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalFeedback: number;
  responseRate: number;
  mentalHealthAlerts: number;
  gradeDistribution: {
    grade: string;
    studentCount: number;
    responseRate: number;
  }[];
  subjectPerformance: {
    subject: string;
    avgRating: number;
    totalClasses: number;
    responseCount: number;
  }[];
  teacherPerformance: {
    teacherName: string;
    avgRating: number;
    totalClasses: number;
    responseRate: number;
  }[];
  wellnessTrends: {
    week: string;
    alertCount: number;
  }[];
}

const AdminAnalyticsDashboard: React.FC<AdminAnalyticsProps> = ({ school }) => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  useEffect(() => {
    const fetchAdminAnalytics = async () => {
      try {
        setIsLoading(true);

        // Fetch school data
        const [studentsData, teachersData, classesData, feedbackData, alertsData] = await Promise.all([
          supabase.from('students').select('*').eq('school', school),
          supabase.from('teachers').select('*').eq('school', school),
          supabase.from('class_schedules').select('*').eq('school', school),
          supabase.from('feedback_analytics').select('*').eq('school', school),
          supabase.from('mental_health_alerts').select('*').eq('school', school).eq('is_reviewed', false)
        ]);

        if (studentsData.data && teachersData.data && classesData.data && feedbackData.data) {
          const totalStudents = studentsData.data.length;
          const totalTeachers = teachersData.data.length;
          const totalClasses = classesData.data.length;
          const totalFeedback = feedbackData.data.reduce((sum, item) => sum + (item.total_responses || 0), 0);
          const responseRate = totalClasses > 0 ? (totalFeedback / totalClasses) * 100 : 0;

          // Calculate grade distribution
          const gradeMap = new Map();
          studentsData.data.forEach(student => {
            if (!gradeMap.has(student.grade)) {
              gradeMap.set(student.grade, { grade: student.grade, studentCount: 0, responseCount: 0 });
            }
            gradeMap.get(student.grade).studentCount++;
          });

          const gradeClassesMap = new Map();
          classesData.data.forEach(cls => {
            if (!gradeClassesMap.has(cls.grade)) {
              gradeClassesMap.set(cls.grade, 0);
            }
            gradeClassesMap.set(cls.grade, gradeClassesMap.get(cls.grade) + 1);
          });

          feedbackData.data.forEach(feedback => {
            const grade = gradeMap.get(feedback.grade);
            if (grade) {
              grade.responseCount += feedback.total_responses || 0;
            }
          });

          const gradeDistribution = Array.from(gradeMap.values()).map(grade => ({
            grade: grade.grade,
            studentCount: grade.studentCount,
            responseRate: gradeClassesMap.get(grade.grade) > 0 
              ? (grade.responseCount / gradeClassesMap.get(grade.grade)) * 100 
              : 0
          }));

          // Calculate subject performance
          const subjectMap = new Map();
          feedbackData.data.forEach(item => {
            if (!subjectMap.has(item.subject)) {
              subjectMap.set(item.subject, {
                subject: item.subject,
                totalRating: 0,
                totalClasses: 0,
                responseCount: 0
              });
            }
            const subject = subjectMap.get(item.subject);
            subject.totalRating += (item.avg_understanding || 0) * (item.total_responses || 0);
            subject.totalClasses++;
            subject.responseCount += item.total_responses || 0;
          });

          const subjectPerformance = Array.from(subjectMap.values()).map(subject => ({
            subject: subject.subject,
            avgRating: subject.responseCount > 0 ? subject.totalRating / subject.responseCount : 0,
            totalClasses: subject.totalClasses,
            responseCount: subject.responseCount
          }));

          // Calculate teacher performance
          const { data: teacherFeedback } = await supabase
            .from('feedback')
            .select(`
              *,
              class_schedules!inner(teacher_id, teachers!inner(name))
            `)
            .eq('class_schedules.school', school);

          const teacherMap = new Map();
          teacherFeedback?.forEach(feedback => {
            const teacherName = feedback.class_schedules.teachers.name;
            if (!teacherMap.has(teacherName)) {
              teacherMap.set(teacherName, {
                teacherName,
                totalRating: 0,
                responseCount: 0,
                classCount: 0
              });
            }
            const teacher = teacherMap.get(teacherName);
            teacher.totalRating += feedback.understanding || 0;
            teacher.responseCount++;
          });

          classesData.data.forEach(cls => {
            const teacher = teachersData.data.find(t => t.id === cls.teacher_id);
            if (teacher) {
              const teacherData = teacherMap.get(teacher.name);
              if (teacherData) {
                teacherData.classCount++;
              }
            }
          });

          const teacherPerformance = Array.from(teacherMap.values()).map(teacher => ({
            teacherName: teacher.teacherName,
            avgRating: teacher.responseCount > 0 ? teacher.totalRating / teacher.responseCount : 0,
            totalClasses: teacher.classCount,
            responseRate: teacher.classCount > 0 ? (teacher.responseCount / teacher.classCount) * 100 : 0
          }));

          setAnalytics({
            totalStudents,
            totalTeachers,
            totalClasses,
            totalFeedback,
            responseRate: Math.round(responseRate * 10) / 10,
            mentalHealthAlerts: alertsData.data?.length || 0,
            gradeDistribution,
            subjectPerformance,
            teacherPerformance,
            wellnessTrends: [] // Would be calculated based on historical data
          });
        }
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminAnalytics();
  }, [school, selectedTimeframe]);

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
            {t('analytics.noAdminData') || 'No analytics data available for this school yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {t('analytics.schoolAnalytics') || 'School Analytics Dashboard'}
        </h2>
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('analytics.thisWeek') || 'This Week'}</SelectItem>
            <SelectItem value="month">{t('analytics.thisMonth') || 'This Month'}</SelectItem>
            <SelectItem value="semester">{t('analytics.thisSemester') || 'This Semester'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalStudents') || 'Total Students'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalTeachers') || 'Total Teachers'}
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalClasses') || 'Total Classes'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.responseRate') || 'Response Rate'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.mentalHealthAlerts') || 'Mental Health Alerts'}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.mentalHealthAlerts}</div>
            {analytics.mentalHealthAlerts > 0 && (
              <Badge variant="destructive" className="mt-1">
                {t('analytics.needsAttention') || 'Needs Attention'}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('analytics.gradeDistribution') || 'Grade Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="studentCount" fill="#8884d8" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('analytics.subjectPerformance') || 'Subject Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.subjectPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subject, avgRating }) => `${subject}: ${avgRating.toFixed(1)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="avgRating"
                >
                  {analytics.subjectPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('analytics.teacherPerformance') || 'Teacher Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.teacherPerformance.map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{teacher.teacherName}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.totalClasses} classes • {Math.round(teacher.responseRate)}% response rate
                  </p>
                </div>
                <Badge variant={teacher.avgRating >= 4 ? "default" : "secondary"}>
                  {Math.round(teacher.avgRating * 10) / 10}/5
                </Badge>
              </div>
            ))}
            {analytics.teacherPerformance.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('analytics.noTeacherData') || 'No teacher performance data available yet'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsDashboard;
