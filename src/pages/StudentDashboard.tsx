
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StudentUpcomingClasses from "@/components/dashboard/student/StudentUpcomingClasses";
import WeeklySummaryForm from "@/components/dashboard/student/WeeklySummaryForm";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import FeedbackForm from "@/components/FeedbackForm";
import { LogOut } from "lucide-react";

const StudentDashboard = () => {
  const { student, logout, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'classes';
  const classId = searchParams.get('classId');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {student.full_name} - Grade {student.grade} at {student.school}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classes">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="feedback">Leave Feedback</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="support">Mental Health Support</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <StudentUpcomingClasses student={student} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <FeedbackForm 
              student={student} 
              classScheduleId={classId}
              onFeedbackSubmitted={() => {
                // Redirect back to classes tab after feedback submission
                window.location.href = '/student-dashboard?tab=classes';
              }}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <WeeklySummaryForm student={student} />
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <MentalHealthSupportTab
              psychologists={[]} // Will be fetched based on school
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
