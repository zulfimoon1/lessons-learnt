
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherAnalyticsDashboard from '@/components/analytics/TeacherAnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

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
