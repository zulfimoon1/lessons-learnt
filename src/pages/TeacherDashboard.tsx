
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, BarChartIcon, BrainIcon, BookOpenIcon, KeyIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-device";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import WeeklySummariesTab from "@/components/dashboard/teacher/WeeklySummariesTab";
import ArticlesTab from "@/components/dashboard/teacher/ArticlesTab";
import AnalyticsTab from "@/components/dashboard/teacher/AnalyticsTab";
import AIInsightsTab from "@/components/dashboard/teacher/AIInsightsTab";
import StudentPasswordReset from "@/components/dashboard/teacher/StudentPasswordReset";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import DoctorChatDashboard from "@/components/DoctorChatDashboard";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";
import { cn } from '@/lib/utils';

const TeacherDashboard: React.FC = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('feedback');
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

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
      // For regular teachers, include schedule, notes, and password reset
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
          value: 'password-reset',
          icon: KeyIcon,
          label: 'Password Reset',
          component: <StudentPasswordReset teacher={teacher} />,
          color: 'text-brand-orange'
        },
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
    <MobileOptimizedLayout className="bg-gradient-to-br from-brand-teal/5 via-white to-brand-orange/5">
      <DashboardHeader
        title={isDoctor ? 'Doctor Dashboard' : (t('teacher.dashboard.title') || 'Teacher Dashboard')}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className={cn(
        'container mx-auto max-w-7xl',
        isMobile ? 'px-4 py-4' : isTablet ? 'px-4 py-6' : 'px-4 py-6'
      )}>
        {/* Hero Welcome Section */}
        <EnhancedLazyLoader minHeight={isMobile ? "200px" : "250px"}>
          <div className={cn(
            'relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-teal to-brand-orange text-white shadow-2xl mb-8',
            isMobile ? 'p-6' : isTablet ? 'p-6' : 'p-8'
          )}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className={cn(
                'flex items-start justify-between gap-6',
                isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row'
              )}>
                <div className="flex-1">
                  <h1 className={cn(
                    'font-bold mb-3',
                    isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl lg:text-5xl'
                  )}>
                    {t('admin.welcome') || 'Welcome'}, {teacher.name}!
                  </h1>
                  <p className={cn(
                    'text-white/90 mb-2',
                    isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl lg:text-2xl'
                  )}>
                    {teacher.school}
                  </p>
                  <p className={cn(
                    'text-white/80 mb-4',
                    isMobile ? 'text-base' : 'text-lg'
                  )}>
                    {isDoctor ? 'School Doctor' : (t('teacher.role') || 'Teacher')}
                  </p>
                  <div className={cn(
                    'inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    {isDoctor ? 'Ready to support student health' : (t('common.ready') || 'Ready to teach')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EnhancedLazyLoader>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <EnhancedLazyLoader minHeight={isMobile ? "120px" : "150px"}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
              <h2 className={cn(
                'font-semibold text-gray-900 mb-4',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                {t('dashboard.quickActions') || 'Quick Actions'}
              </h2>
              <TabsList className={cn(
                'bg-transparent p-0 h-auto gap-3',
                isMobile ? 'grid grid-cols-1 gap-2' : 
                isTablet ? 'grid grid-cols-2 gap-3' : 
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}>
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger 
                      key={item.value}
                      value={item.value} 
                      className={cn(
                        'h-auto flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start transition-all duration-300 rounded-lg bg-white',
                        'data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal',
                        isMobile ? 'p-3 flex-col text-center min-h-[70px]' : 
                        isTablet ? 'p-3 flex-row' : 
                        'p-4 flex-row min-h-[80px]'
                      )}
                    >
                      <Icon 
                        className={cn(
                          activeTab === item.value ? 'text-white' : item.color,
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        )}
                        aria-hidden="true"
                      />
                      <div className={isMobile ? 'text-center' : 'text-left'}>
                        <span className={cn(
                          'font-medium block',
                          isMobile ? 'text-xs' : 'text-sm'
                        )}>
                          {item.label}
                        </span>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </EnhancedLazyLoader>

          {/* Tab Content */}
          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="space-y-6">
              <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
                  <div className={cn(
                    isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'
                  )}>
                    {item.component}
                  </div>
                </div>
              </EnhancedLazyLoader>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </MobileOptimizedLayout>
  );
};

export default TeacherDashboard;
