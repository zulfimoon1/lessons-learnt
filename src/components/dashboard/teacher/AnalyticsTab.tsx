
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherAnalyticsDashboard from '@/components/analytics/TeacherAnalyticsDashboard';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

interface AnalyticsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      {/* Header Section - Matching Student Dashboard Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">
              Insights into your teaching performance and student engagement
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards - Matching Student Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-brand-teal bg-gradient-to-r from-brand-teal/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">124</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-orange bg-gradient-to-r from-brand-orange/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Avg. Understanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87%</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Classes This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">28</div>
            <p className="text-xs text-gray-500">8 subjects covered</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics Dashboard */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <TeacherAnalyticsDashboard 
            teacherId={teacher.id}
            school={teacher.school}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
