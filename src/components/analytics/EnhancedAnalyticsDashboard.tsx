
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, MessageSquare, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalyticsData {
  engagement: Array<{ date: string; students: number; feedback: number; completion: number }>;
  performance: Array<{ subject: string; understanding: number; interest: number; growth: number }>;
  distribution: Array<{ grade: string; count: number; color: string }>;
  trends: {
    totalStudents: { value: number; change: number };
    averageEngagement: { value: number; change: number };
    feedbackCount: { value: number; change: number };
    completionRate: { value: number; change: number };
  };
}

interface EnhancedAnalyticsDashboardProps {
  data?: AnalyticsData;
  userRole?: 'teacher' | 'admin' | 'student';
  className?: string;
}

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({
  data,
  userRole = 'teacher',
  className
}) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  // Mock data if none provided
  const defaultData: AnalyticsData = {
    engagement: [
      { date: '2024-01-01', students: 45, feedback: 38, completion: 85 },
      { date: '2024-01-02', students: 52, feedback: 41, completion: 78 },
      { date: '2024-01-03', students: 48, feedback: 44, completion: 92 },
      { date: '2024-01-04', students: 55, feedback: 47, completion: 85 },
      { date: '2024-01-05', students: 61, feedback: 52, completion: 88 },
      { date: '2024-01-06', students: 58, feedback: 49, completion: 84 },
      { date: '2024-01-07', students: 64, feedback: 56, completion: 91 }
    ],
    performance: [
      { subject: 'Mathematics', understanding: 7.8, interest: 6.9, growth: 8.2 },
      { subject: 'Science', understanding: 8.1, interest: 8.5, growth: 7.9 },
      { subject: 'English', understanding: 7.5, interest: 7.2, growth: 8.0 },
      { subject: 'History', understanding: 6.9, interest: 6.5, growth: 7.1 }
    ],
    distribution: [
      { grade: 'Grade 1', count: 45, color: '#8884d8' },
      { grade: 'Grade 2', count: 52, color: '#82ca9d' },
      { grade: 'Grade 3', count: 38, color: '#ffc658' },
      { grade: 'Grade 4', count: 41, color: '#ff7c7c' },
      { grade: 'Grade 5', count: 35, color: '#8dd1e1' }
    ],
    trends: {
      totalStudents: { value: 211, change: 12.5 },
      averageEngagement: { value: 87.3, change: 5.2 },
      feedbackCount: { value: 156, change: -2.1 },
      completionRate: { value: 85.4, change: 8.7 }
    }
  };

  const analyticsData = data || defaultData;

  const MetricCard: React.FC<{
    title: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    format?: 'number' | 'percentage';
  }> = ({ title, value, change, icon, format = 'number' }) => {
    const isPositive = change > 0;
    const formattedValue = format === 'percentage' ? `${value}%` : value.toString();
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{formattedValue}</h3>
                <div className={cn(
                  'flex items-center text-xs',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(change)}%
                </div>
              </div>
            </div>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const exportData = () => {
    // Generate CSV data
    const csvData = [
      ['Date', 'Students', 'Feedback', 'Completion Rate'],
      ...analyticsData.engagement.map(item => [
        item.date,
        item.students.toString(),
        item.feedback.toString(),
        item.completion.toString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {t('analytics.title') || 'Analytics Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            {t('analytics.subtitle') || 'Comprehensive insights into learning engagement and performance'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportData} size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.export') || 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('analytics.totalStudents') || 'Total Students'}
          value={analyticsData.trends.totalStudents.value}
          change={analyticsData.trends.totalStudents.change}
          icon={<Users className="w-6 h-6" />}
        />
        <MetricCard
          title={t('analytics.engagement') || 'Avg. Engagement'}
          value={analyticsData.trends.averageEngagement.value}
          change={analyticsData.trends.averageEngagement.change}
          icon={<TrendingUp className="w-6 h-6" />}
          format="percentage"
        />
        <MetricCard
          title={t('analytics.feedback') || 'Feedback Count'}
          value={analyticsData.trends.feedbackCount.value}
          change={analyticsData.trends.feedbackCount.change}
          icon={<MessageSquare className="w-6 h-6" />}
        />
        <MetricCard
          title={t('analytics.completion') || 'Completion Rate'}
          value={analyticsData.trends.completionRate.value}
          change={analyticsData.trends.completionRate.change}
          icon={<BookOpen className="w-6 h-6" />}
          format="percentage"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('analytics.engagementTrends') || 'Engagement Trends'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#8884d8"
                  name="Active Students"
                />
                <Line
                  type="monotone"
                  dataKey="feedback"
                  stroke="#82ca9d"
                  name="Feedback Submitted"
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#ffc658"
                  name="Completion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('analytics.subjectPerformance') || 'Subject Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="understanding" fill="#8884d8" name="Understanding" />
                <Bar dataKey="interest" fill="#82ca9d" name="Interest" />
                <Bar dataKey="growth" fill="#ffc658" name="Growth" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('analytics.gradeDistribution') || 'Grade Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {analyticsData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t('analytics.recentActivity') || 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New feedback submitted', time: '2 minutes ago', type: 'feedback' },
                { action: 'Class schedule updated', time: '1 hour ago', type: 'schedule' },
                { action: 'Student joined class', time: '3 hours ago', type: 'join' },
                { action: 'Weekly summary generated', time: '1 day ago', type: 'summary' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
