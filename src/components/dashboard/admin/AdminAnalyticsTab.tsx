
import React from 'react';
import AdminAnalyticsDashboard from '@/components/analytics/AdminAnalyticsDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminAnalyticsTabProps {
  teacher: {
    school: string;
    role: string;
    name: string;
  };
}

const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({ teacher }) => {
  const { t } = useLanguage();
  if (teacher.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {t('dashboard.accessDenied')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">{t('admin.schoolAnalytics')}</h2>
          <p className="text-brand-dark/70">
            {t('admin.comprehensiveAnalyticsFor', { school: teacher.school })}
          </p>
        </div>
      </div>
      
      <AdminAnalyticsDashboard school={teacher.school} />
    </div>
  );
};

export default AdminAnalyticsTab;
