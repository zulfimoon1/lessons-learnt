
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquareIcon, CalendarIcon, FileTextIcon, HeartIcon, BarChartIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpcomingClassesTab from "@/components/dashboard/UpcomingClassesTab";
import FeedbackTab from "@/components/dashboard/FeedbackTab";
import WeeklySummaryTab from "@/components/dashboard/WeeklySummaryTab";
import WelcomeSection from "@/components/dashboard/student/WelcomeSection";
import QuickActionsCard from "@/components/dashboard/student/QuickActionsCard";
import WellnessTracker from "@/components/dashboard/student/WellnessTracker";
import StudentAnalyticsDashboard from "@/components/analytics/StudentAnalyticsDashboard";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import { classScheduleService } from "@/services/classScheduleService";
import AIStudentInsights from "@/components/dashboard/student/AIStudentInsights";

const StudentDashboard: React.FC = () => {
  const { student, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  console.log('StudentDashboard: Rendering with student:', student?.full_name);

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      if (!student) return;
      
      try {
        console.log('StudentDashboard: Fetching classes for student:', student.full_name);
        setIsLoading(true);
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        if (response.data) {
          // Filter classes for student's grade and only show future classes
          const now = new Date();
          const filteredClasses = response.data.filter(
            (classItem: any) => {
              if (classItem.grade !== student.grade) return false;
              
              // Only show classes that haven't happened yet
              const classDateTime = new Date(`${classItem.class_date}T${classItem.class_time}`);
              return classDateTime > now;
            }
          );
          console.log('StudentDashboard: Filtered classes:', filteredClasses.length);
          setUpcomingClasses(filteredClasses);
        }
      } catch (error) {
        console.error('StudentDashboard: Error fetching upcoming classes:', error);
        toast.error(t('common.error') || 'Failed to load upcoming classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, [student, t]);

  const handleLogout = async () => {
    try {
      logout();
      toast.success(t('auth.logoutSuccess') || 'Logged out successfully');
    } catch (error) {
      toast.error(t('auth.logoutError') || 'Logout failed');
    }
  };

  const handleQuickActions = {
    onViewClasses: () => {
      console.log('StudentDashboard: Quick action - View Classes');
      setActiveTab('classes');
    },
    onSubmitFeedback: () => {
      console.log('StudentDashboard: Quick action - Submit Feedback');
      setActiveTab('feedback');
    },
    onWeeklySummary: () => {
      console.log('StudentDashboard: Quick action - Weekly Summary');
      setActiveTab('summary');
    },
    onWellnessCheck: () => {
      console.log('StudentDashboard: Quick action - Wellness Check');
      setActiveTab('wellness');
    }
  };

  const handleMoodSubmit = (entry: any) => {
    console.log('StudentDashboard: Mood entry submitted:', entry);
    toast.success(t('wellness.submitted') || 'Wellness check submitted successfully');
    // Here you would typically save to database
  };

  if (!student) {
    console.log('StudentDashboard: No student found, redirecting to login');
    return <Navigate to="/student-login" replace />;
  }

  console.log('StudentDashboard: Rendering dashboard for student:', student.full_name);

  const tabItems = [
    {
      value: 'classes',
      icon: CalendarIcon,
      label: t('dashboard.upcomingClasses') || 'Classes',
      component: (
        <UpcomingClassesTab
          classes={upcomingClasses}
          studentGrade={student.grade}
          studentSchool={student.school}
        />
      )
    },
    {
      value: 'feedback',
      icon: MessageSquareIcon,
      label: t('dashboard.feedback') || 'Feedback',
      component: <FeedbackTab />
    },
    {
      value: 'summary',
      icon: FileTextIcon,
      label: t('dashboard.weeklySummary') || 'Summary',
      component: <WeeklySummaryTab student={student} />
    },
    {
      value: 'wellness',
      icon: HeartIcon,
      label: t('dashboard.mentalHealth') || 'Mental Health',
      component: (
        <MentalHealthSupportTab
          psychologists={[]}
          studentId={student.id}
          studentName={student.full_name}
          studentSchool={student.school}
          studentGrade={student.grade}
        />
      )
    },
    {
      value: 'analytics',
      icon: BarChartIcon,
      label: t('dashboard.analytics') || 'Analytics',
      component: (
        <div className="min-h-[400px]">
          <StudentAnalyticsDashboard
            studentId={student.id}
            school={student.school}
            grade={student.grade}
          />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={t('dashboard.studentDashboard') || 'Student Dashboard'}
        userName={student.full_name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Welcome Section - Preserved */}
        <WelcomeSection
          studentName={student.full_name}
          school={student.school}
          grade={student.grade}
          upcomingClassesCount={upcomingClasses.length}
        />

        {/* Quick Actions Card - New Enhancement */}
        <QuickActionsCard {...handleQuickActions} />

        {/* AI Personal Insights - Enhanced with better visibility */}
        <AIStudentInsights
          studentId={student.id}
          school={student.school}
          grade={student.grade}
        />

        {/* Enhanced Tabs with Analytics and AI */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-1 h-auto p-1' : 'grid-cols-5'}`}>
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value}
                  value={item.value} 
                  className={`flex items-center gap-1 md:gap-2 ${isMobile ? 'flex-col py-2 px-1 text-xs' : 'flex-row'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={isMobile ? 'text-[10px] leading-tight text-center' : ''}>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="mt-6">
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
