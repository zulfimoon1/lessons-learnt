
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquareIcon, CalendarIcon, FileTextIcon, HeartIcon, BarChartIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpcomingClassesTab from "@/components/dashboard/UpcomingClassesTab";
import FeedbackTab from "@/components/dashboard/FeedbackTab";
import WeeklySummaryTab from "@/components/dashboard/WeeklySummaryTab";
import WelcomeSection from "@/components/dashboard/student/WelcomeSection";
import QuickActionsCard from "@/components/dashboard/student/QuickActionsCard";
import WellnessTracker from "@/components/dashboard/student/WellnessTracker";
import StudentAnalyticsDashboard from "@/components/analytics/StudentAnalyticsDashboard";
import { classScheduleService } from "@/services/classScheduleService";

const StudentDashboard: React.FC = () => {
  const { student, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      if (!student) return;
      
      try {
        setIsLoading(true);
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        if (response.data) {
          // Filter classes for student's grade
          const filteredClasses = response.data.filter(
            (classItem: any) => classItem.grade === student.grade
          );
          setUpcomingClasses(filteredClasses);
        }
      } catch (error) {
        console.error('Error fetching upcoming classes:', error);
        toast.error('Failed to load upcoming classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, [student]);

  const handleLogout = async () => {
    try {
      logout();
      toast.success(t('auth.logoutSuccess') || 'Logged out successfully');
    } catch (error) {
      toast.error(t('auth.logoutError') || 'Logout failed');
    }
  };

  const handleQuickActions = {
    onViewClasses: () => setActiveTab('classes'),
    onSubmitFeedback: () => setActiveTab('feedback'),
    onWeeklySummary: () => setActiveTab('summary'),
    onWellnessCheck: () => setActiveTab('wellness')
  };

  const handleMoodSubmit = (entry: any) => {
    console.log('Mood entry submitted:', entry);
    toast.success(t('wellness.submitted') || 'Wellness check submitted successfully');
    // Here you would typically save to database
  };

  if (!student) {
    return <Navigate to="/student-login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={t('dashboard.studentDashboard') || 'Student Dashboard'}
        userName={student.full_name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Section - Preserved */}
        <WelcomeSection
          studentName={student.full_name}
          school={student.school}
          grade={student.grade}
          upcomingClassesCount={upcomingClasses.length}
        />

        {/* Quick Actions Card - New Enhancement */}
        <QuickActionsCard {...handleQuickActions} />

        {/* Enhanced Tabs with Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {t('class.upcomingClasses') || 'Classes'}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4" />
              {t('dashboard.feedback') || 'Feedback'}
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" />
              {t('weekly.summary') || 'Summary'}
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center gap-2">
              <HeartIcon className="w-4 h-4" />
              {t('features.mentalHealth.title') || 'Wellness'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" />
              {t('analytics.title') || 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <UpcomingClassesTab
              classes={upcomingClasses}
              studentGrade={student.grade}
              studentSchool={student.school}
            />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackTab />
          </TabsContent>

          <TabsContent value="summary">
            <WeeklySummaryTab student={student} />
          </TabsContent>

          <TabsContent value="wellness">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WellnessTracker
                onMoodSubmit={handleMoodSubmit}
                recentEntries={[]} // Would be loaded from database
              />
              <div className="space-y-4">
                <div className="text-center py-8">
                  <HeartIcon className="w-16 h-16 text-brand-orange mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('features.mentalHealth.title') || 'Mental Health Support'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('features.mentalHealth.description') || 'Access wellness resources and mental health support when you need it.'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <StudentAnalyticsDashboard
              studentId={student.id}
              school={student.school}
              grade={student.grade}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
