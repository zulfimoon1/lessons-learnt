
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

const TeacherDashboard: React.FC = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('schedule');
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      logout();
      toast.success(t('auth.logoutSuccess') || 'Logged out successfully');
    } catch (error) {
      toast.error(t('auth.logoutError') || 'Logout failed');
    }
  };

  if (!teacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  const tabItems = [
    {
      value: 'schedule',
      icon: CalendarIcon,
      label: t('teacher.schedule') || 'Schedule',
      component: <ScheduleTab teacher={teacher} />
    },
    {
      value: 'feedback',
      icon: MessageSquareIcon,
      label: t('dashboard.feedback') || 'Feedback',
      component: <FeedbackDashboard teacher={teacher} />
    },
    {
      value: 'summaries',
      icon: FileTextIcon,
      label: t('weekly.summaries') || 'Summaries',
      component: <WeeklySummariesTab teacher={teacher} />
    },
    {
      value: 'bulk',
      icon: BookOpenIcon,
      label: t('teacher.bulkUpload') || 'Bulk Upload',
      component: <BulkUploadTab teacher={teacher} />
    },
    {
      value: 'mental-health',
      icon: UsersIcon,
      label: t('features.mentalHealth.title') || 'Mental Health',
      component: <MentalHealthTab teacher={teacher} />
    },
    {
      value: 'articles',
      icon: FileTextIcon,
      label: t('teacher.articles') || 'Articles',
      component: <ArticlesTab teacher={teacher} />
    },
    {
      value: 'analytics',
      icon: BarChartIcon,
      label: t('analytics.title') || 'Analytics',
      component: <AnalyticsTab teacher={teacher} />
    },
    {
      value: 'ai-insights',
      icon: BrainIcon,
      label: t('ai.insights') || 'AI Insights',
      component: <AIInsightsTab teacher={teacher} />
    }
  ];

  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      <DashboardHeader
        title={t('dashboard.teacherDashboard') || 'Teacher Dashboard'}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Welcome Section with Student Dashboard Aesthetic */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 mb-6 md:mb-8 border border-border/50 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-brand-dark mb-2 md:mb-3">
                {t('admin.welcome') || 'Welcome'}, {teacher.name}!
              </h1>
              <p className="text-sm md:text-lg text-brand-dark/70 mb-4">
                {teacher.school} • {teacher.role === 'admin' ? t('admin.role') || 'School Administrator' : t('teacher.role') || 'Teacher'}
              </p>
              <div className="inline-flex items-center gap-2 bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></div>
                {t('common.ready') || 'Ready'}
              </div>
            </div>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-brand-teal/20">
                <div className="text-lg md:text-2xl font-bold text-brand-dark">8</div>
                <div className="text-xs text-brand-dark/60">{t('teacher.classes.today') || 'Today\'s Classes'}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-brand-orange/20">
                <div className="text-lg md:text-2xl font-bold text-brand-dark">24</div>
                <div className="text-xs text-brand-dark/60">{t('teacher.stats.totalStudents') || 'Total Students'}</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className={`grid w-full bg-white/60 backdrop-blur-sm border border-border/50 shadow-sm ${isMobile ? 'grid-cols-2 gap-1 h-auto p-1' : 'grid-cols-8'}`}>
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value}
                  value={item.value} 
                  className={`flex items-center gap-1 md:gap-2 data-[state=active]:bg-brand-teal data-[state=active]:text-white transition-all duration-200 ${isMobile ? 'flex-col py-2 px-1 text-xs' : 'flex-row'}`}
                >
                  <Icon className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span className={isMobile ? 'text-[10px] leading-tight' : ''}>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
              <div className="p-4 md:p-6">
                {item.component}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
