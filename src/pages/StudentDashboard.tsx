
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StudentUpcomingClasses from "@/components/dashboard/student/StudentUpcomingClasses";
import WeeklySummaryForm from "@/components/dashboard/student/WeeklySummaryForm";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import FeedbackForm from "@/components/FeedbackForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StudentDashboard = () => {
  const { student, logout, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'classes';
  const classId = searchParams.get('classId');
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  if (!student) {
    return <Navigate to="/student-login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-brand-teal/20">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">{t('dashboard.title')}</h1>
            <p className="text-brand-dark/70">
              {t('dashboard.welcome')}, {student.full_name} - {t('dashboard.grade')} {student.grade} {t('auth.school').toLowerCase()} {student.school}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleLogout} className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-brand-teal/20">
            <TabsTrigger value="classes" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">
              {t('dashboard.upcomingClasses')}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">
              {t('dashboard.feedback')}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white text-brand-dark">
              {t('dashboard.weeklySummary')}
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">
              {t('dashboard.mentalHealthSupport')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <StudentUpcomingClasses student={student} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <FeedbackForm 
              student={student} 
              classScheduleId={classId}
              onFeedbackSubmitted={() => {
                window.location.href = '/student-dashboard?tab=classes';
              }}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <WeeklySummaryForm student={student} />
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <MentalHealthSupportTab
              psychologists={[]}
              studentId={student.id}
              studentName={student.full_name}
              studentSchool={student.school}
              studentGrade={student.grade}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
