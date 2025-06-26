
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, MessageSquare, Settings, School } from "lucide-react";
import FeedbackAnalytics from "@/components/dashboard/admin/FeedbackAnalytics";
import TeacherManagement from "@/components/dashboard/admin/TeacherManagement";
import SchoolAdminDashboard from "@/components/dashboard/admin/SchoolAdminDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const AdminDashboard = () => {
  const { teacher, logout, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teacher || teacher.role !== 'admin') {
    return <Navigate to="/teacher-login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/5 via-white to-brand-orange/5">
      <DashboardHeader 
        title={t('admin.title') || 'School Admin Dashboard'}
        userName={`${teacher.name} - ${teacher.school}`}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Welcome Section */}
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
                  {t('admin.role') || 'School Administrator'}
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {t('common.ready') || 'Ready to manage'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('dashboard.quickActions') || 'Admin Tools'}
            </h2>
            <TabsList className="bg-transparent p-0 h-auto gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <TabsTrigger 
                value="overview" 
                className="h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white"
              >
                <School className="w-5 h-5" />
                <span className="text-sm font-medium">School Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Feedback Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white"
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Staff Management</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-start data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="p-6">
                <SchoolAdminDashboard teacher={teacher} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="p-6">
                <FeedbackAnalytics school={teacher.school} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="p-6">
                <TeacherManagement school={teacher.school} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="p-6">
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">School Settings</h3>
                  <p className="text-gray-600">
                    School configuration and administrative settings will be available here.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
