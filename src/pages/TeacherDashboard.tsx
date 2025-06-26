
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, BarChartIcon, BrainIcon, BookOpenIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import WeeklySummariesTab from "@/components/dashboard/teacher/WeeklySummariesTab";
import ArticlesTab from "@/components/dashboard/teacher/ArticlesTab";
import AnalyticsTab from "@/components/dashboard/teacher/AnalyticsTab";
import AIInsightsTab from "@/components/dashboard/teacher/AIInsightsTab";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import DoctorChatDashboard from "@/components/DoctorChatDashboard";

const TeacherDashboard: React.FC = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('feedback');
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

  // Redirect school admins to the admin dashboard
  if (teacher.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Check if user is a doctor
  const isDoctor = teacher.role === 'doctor';

  // Define tab items based on role
  const getTabItems = () => {
    const baseItems = [
      {
        value: 'feedback',
        icon: MessageSquareIcon,
        label: t('dashboard.feedback') || 'Feedback',
        component: <FeedbackDashboard teacher={teacher} />,
        color: 'text-brand-orange'
      },
      {
        value: 'summaries',
        icon: FileTextIcon,
        label: t('weekly.summaries') || 'Summaries',
        component: <WeeklySummariesTab teacher={teacher} />,
        color: 'text-brand-teal'
      },
      {
        value: 'analytics',
        icon: BarChartIcon,
        label: t('analytics.title') || 'Analytics',
        component: <AnalyticsTab teacher={teacher} />,
        color: 'text-brand-teal'
      },
      {
        value: 'ai-insights',
        icon: BrainIcon,
        label: t('ai.insights') || 'AI Insights',
        component: <AIInsightsTab teacher={teacher} />,
        color: 'text-brand-orange'
      }
    ];

    if (isDoctor) {
      // For doctors, add doctor-specific tabs and remove schedule/notes
      return [
        ...baseItems,
        {
          value: 'doctor-dashboard',
          icon: MessageSquareIcon,
          label: 'Medical Dashboard',
          component: <DoctorDashboard teacher={teacher} />,
          color: 'text-brand-teal'
        },
        {
          value: 'doctor-chat',
          icon: MessageSquareIcon,
          label: 'Live Chat',
          component: <DoctorChatDashboard doctorId={teacher.id} doctorName={teacher.name} school={teacher.school} />,
          color: 'text-brand-orange'
        }
      ];
    } else {
      // For regular teachers, include schedule and notes
      return [
        {
          value: 'schedule',
          icon: CalendarIcon,
          label: t('teacher.schedule') || 'Schedule',
          component: <ScheduleTab teacher={teacher} />,
          color: 'text-brand-teal'
        },
        ...baseItems,
        {
          value: 'notes',
          icon: BookOpenIcon,
          label: t('teacher.notes') || 'Teachers Notes',
          component: <ArticlesTab teacher={teacher} />,
          color: 'text-brand-orange'
        }
      ];
    }
  };

  const tabItems = getTabItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/5 via-white to-brand-orange/5">
      <DashboardHeader
        title={isDoctor ? 'Doctor Dashboard' : (t('teacher.dashboard.title') || 'Teacher Dashboard')}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Welcome Section - Matching Student Dashboard */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-teal to-brand-orange p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-5xl font-bold mb-3">
                  {t('admin.welcome') || 'Welcome'}, {teacher.name}!
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 mb-2">
                  {teacher.school}
                </p>
                <p className="text-lg text-white/80 mb-4">
                  {isDoctor ? 'School Doctor' : (t('teacher.role') || 'Teacher')}
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {isDoctor ? 'Ready to support student health' : (t('common.ready') || 'Ready to teach')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Proper Radix UI Structure with Student Styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('dashboard.quickActions') || 'Quick Actions'}
            </h2>
            <TabsList className="bg-transparent p-0 h-auto gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger 
                    key={item.value}
                    value={item.value} 
                    className={`
                      h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start
                      data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal
                      transition-all duration-300 rounded-lg bg-white
                      ${isMobile ? 'flex-col text-center min-h-[80px]' : 'flex-row'}
                    `}
                  >
                    <Icon 
                      className={`w-5 h-5 ${activeTab === item.value ? 'text-white' : item.color}`}
                      aria-hidden="true"
                    />
                    <div className={isMobile ? 'text-center' : 'text-left'}>
                      <span className="text-sm font-medium block">
                        {item.label}
                      </span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
                <div className="p-6">
                  {item.component}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
