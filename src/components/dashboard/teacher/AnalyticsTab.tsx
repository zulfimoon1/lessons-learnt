
import React from 'react';
import TeacherAnalyticsDashboard from '@/components/analytics/TeacherAnalyticsDashboard';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Analytics Dashboard</h2>
          <p className="text-brand-dark/70">
            Insights into your teaching performance and student engagement
          </p>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-6">
        <TeacherAnalyticsDashboard 
          teacherId={teacher.id}
          school={teacher.school}
        />
      </div>
    </div>
  );
};

export default AnalyticsTab;
