
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, BookOpenIcon, UsersIcon, BarChartIcon, BrainIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={t('dashboard.teacherDashboard') || 'Teacher Dashboard'}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            {t('admin.welcome') || 'Welcome'}, {teacher.name}!
          </h1>
          <p className="text-brand-dark/70">
            {teacher.school} • {teacher.role === 'admin' ? t('admin.role') || 'School Administrator' : t('teacher.role') || 'Teacher'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {t('teacher.schedule') || 'Schedule'}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4" />
              {t('dashboard.feedback') || 'Feedback'}
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" />
              {t('weekly.summaries') || 'Summaries'}
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              {t('teacher.bulkUpload') || 'Bulk Upload'}
            </TabsTrigger>
            <TabsTrigger value="mental-health" className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              {t('features.mentalHealth.title') || 'Mental Health'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" />
              {t('teacher.articles') || 'Articles'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              {t('analytics.title') || 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <BrainIcon className="w-4 h-4" />
              {t('ai.insights') || 'AI Insights'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <ScheduleTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackDashboard teacher={teacher} />
          </TabsContent>

          <TabsContent value="summaries">
            <WeeklySummariesTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkUploadTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="mental-health">
            <MentalHealthTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsightsTab teacher={teacher} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
