
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, BookOpenIcon, UsersIcon, BarChartIcon, BrainIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import WeeklySummariesTab from "@/components/dashboard/teacher/WeeklySummariesTab";
import BulkUploadTab from "@/components/dashboard/teacher/BulkUploadTab";
import MentalHealthTab from "@/components/dashboard/teacher/MentalHealthTab";
import ArticlesTab from "@/components/dashboard/teacher/ArticlesTab";
import AnalyticsTab from "@/components/dashboard/teacher/AnalyticsTab";
import AIInsightsTab from "@/components/dashboard/teacher/AIInsightsTab";
import DemoDoctorDashboard from "@/components/dashboard/doctor/DemoDoctorDashboard";

const TeacherDashboard: React.FC = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('schedule');
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      logout();
      toast.success(t('teacher.logout.success'));
    } catch (error) {
      toast.error(t('auth.logoutError'));
    }
  };

  if (!teacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  // If teacher is a doctor, show the specialized doctor dashboard
  if (teacher.role === 'doctor') {
    return <DemoDoctorDashboard teacher={teacher} onLogout={handleLogout} />;
  }

  const tabItems = [
    {
      value: 'schedule',
      icon: CalendarIcon,
      label: t('teacher.schedule'),
      component: <ScheduleTab teacher={teacher} />
    },
    {
      value: 'feedback',
      icon: MessageSquareIcon,
      label: t('dashboard.feedback'),
      component: <FeedbackDashboard teacher={teacher} />
    },
    {
      value: 'summaries',
      icon: FileTextIcon,
      label: t('weekly.summaries'),
      component: <WeeklySummariesTab teacher={teacher} />
    },
    {
      value: 'bulk',
      icon: BookOpenIcon,
      label: t('teacher.bulkUpload'),
      component: <BulkUploadTab teacher={teacher} />
    },
    {
      value: 'mental-health',
      icon: UsersIcon,
      label: t('features.mentalHealth.title'),
      component: <MentalHealthTab teacher={teacher} />
    },
    {
      value: 'articles',
      icon: FileTextIcon,
      label: t('teacher.articles'),
      component: <ArticlesTab teacher={teacher} />
    },
    {
      value: 'analytics',
      icon: BarChartIcon,
      label: t('analytics.title'),
      component: <AnalyticsTab teacher={teacher} />
    },
    {
      value: 'ai-insights',
      icon: BrainIcon,
      label: t('ai.insights'),
      component: <AIInsightsTab teacher={teacher} />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={t('dashboard.teacherDashboard')}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
            {t('dashboard.welcome')}, {teacher.name}!
          </h1>
          <p className="text-sm md:text-base text-brand-dark/70">
            {teacher.school} • {teacher.role === 'admin' ? t('admin.role') : t('teacher.role')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1 h-auto p-1' : 'grid-cols-8'}`}>
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value}
                  value={item.value} 
                  className={`flex items-center gap-1 md:gap-2 ${isMobile ? 'flex-col py-2 px-1 text-xs' : 'flex-row'}`}
                >
                  <Icon className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span className={isMobile ? 'text-[10px] leading-tight' : ''}>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
