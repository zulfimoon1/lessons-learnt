
import React from 'react';
import AdminAnalyticsDashboard from '@/components/analytics/AdminAnalyticsDashboard';

interface AdminAnalyticsTabProps {
  teacher: {
    school: string;
    role: string;
    name: string;
  };
}

const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({ teacher }) => {
  if (teacher.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">School Analytics</h2>
          <p className="text-brand-dark/70">
            Comprehensive analytics for {teacher.school}
          </p>
        </div>
      </div>
      
      <AdminAnalyticsDashboard school={teacher.school} />
    </div>
  );
};

export default AdminAnalyticsTab;
