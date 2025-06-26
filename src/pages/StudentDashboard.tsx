
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquareIcon, CalendarIcon, FileTextIcon, HeartIcon, BarChartIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDeviceType } from "@/hooks/use-device";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpcomingClassesTab from "@/components/dashboard/UpcomingClassesTab";
import FeedbackTab from "@/components/dashboard/FeedbackTab";
import WeeklySummaryTab from "@/components/dashboard/WeeklySummaryTab";
import WelcomeSection from "@/components/dashboard/student/WelcomeSection";
import QuickActionsCard from "@/components/dashboard/student/QuickActionsCard";
import WellnessTracker from "@/components/dashboard/student/WellnessTracker";
import StudentAnalyticsDashboard from "@/components/analytics/StudentAnalyticsDashboard";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import MobileTabs from "@/components/dashboard/student/MobileTabs";
import WelcomeTour from "@/components/onboarding/WelcomeTour";
import { classScheduleService } from "@/services/classScheduleService";
import AIStudentInsights from "@/components/dashboard/student/AIStudentInsights";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";
import { cn } from '@/lib/utils';

const StudentDashboard: React.FC = () => {
  const { student, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  console.log('StudentDashboard: Rendering with student:', student?.full_name);

  useEffect(() => {
    // Check if user has seen the welcome tour
    const hasSeenTour = localStorage.getItem(`welcomeTour_student_${student?.id}`);
    if (!hasSeenTour && student) {
      setShowWelcomeTour(true);
    }
  }, [student]);

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

  const handleWelcomeTourComplete = () => {
    setShowWelcomeTour(false);
    if (student) {
      localStorage.setItem(`welcomeTour_student_${student.id}`, 'completed');
    }
  };

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

  if (!student) {
    console.log('StudentDashboard: No student found, redirecting to login');
    return <Navigate to="/student-login" replace />;
  }

  const tabItems = [
    {
      value: 'classes',
      icon: CalendarIcon,
      label: 'My Classes',
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
      label: 'Share My Thoughts',
      component: <FeedbackTab />
    },
    {
      value: 'summary',
      icon: FileTextIcon,
      label: 'My Week',
      component: <WeeklySummaryTab student={student} />
    },
    {
      value: 'wellness',
      icon: HeartIcon,
      label: 'How I\'m Feeling',
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
      label: 'My Progress',
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
    <MobileOptimizedLayout className="bg-background">
      <DashboardHeader
        title="My Learning Dashboard"
        userName={student.full_name}
        onLogout={handleLogout}
      />

      <main className={cn(
        'max-w-7xl mx-auto space-y-4',
        isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6'
      )}>
        <EnhancedLazyLoader minHeight={isMobile ? "150px" : "200px"}>
          <WelcomeSection
            studentName={student.full_name}
            school={student.school}
            grade={student.grade}
            upcomingClassesCount={upcomingClasses.length}
          />
        </EnhancedLazyLoader>

        <EnhancedLazyLoader minHeight={isMobile ? "120px" : "150px"}>
          <QuickActionsCard {...handleQuickActions} />
        </EnhancedLazyLoader>

        <EnhancedLazyLoader minHeight={isMobile ? "200px" : "250px"}>
          <AIStudentInsights
            studentId={student.id}
            school={student.school}
            grade={student.grade}
          />
        </EnhancedLazyLoader>

        {/* Mobile vs Desktop Tabs */}
        {isMobile ? (
          <div className="space-y-4">
            <MobileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              t={t}
            />
            <EnhancedLazyLoader minHeight="300px">
              <div className="mt-6">
                {tabItems.find(item => item.value === activeTab)?.component}
              </div>
            </EnhancedLazyLoader>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className={cn(
            'space-y-4',
            isTablet ? 'space-y-4' : 'space-y-6'
          )}>
            <TabsList className={cn(
              'grid w-full',
              isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-5'
            )}>
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger 
                    key={item.value}
                    value={item.value} 
                    className={cn(
                      'flex items-center gap-2',
                      isTablet && 'text-sm'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4',
                      isTablet && 'w-3 h-3'
                    )} />
                    <span className={isTablet ? 'hidden sm:inline' : undefined}>
                      {item.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabItems.map((item) => (
              <TabsContent key={item.value} value={item.value} className="mt-6">
                <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
                  {item.component}
                </EnhancedLazyLoader>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      <WelcomeTour
        userType="student"
        isVisible={showWelcomeTour}
        onComplete={handleWelcomeTourComplete}
      />
    </MobileOptimizedLayout>
  );
};

export default StudentDashboard;
