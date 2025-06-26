
import React from 'react';
import TeacherAnalyticsDashboard from '@/components/analytics/TeacherAnalyticsDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalyticsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ teacher }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">{t('analytics.title')}</h2>
          <p className="text-brand-dark/70">
            {t('analytics.description') || 'Insights into your teaching performance and student engagement'}
          </p>
        </div>
      </div>
      
      <TeacherAnalyticsDashboard 
        teacherId={teacher.id}
        school={teacher.school}
      />
    </div>
  );
};

export default AnalyticsTab;
