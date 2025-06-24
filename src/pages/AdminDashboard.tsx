
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SchoolAdminDashboard from "@/components/dashboard/admin/SchoolAdminDashboard";

const AdminDashboard = () => {
  const { teacher, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only school admins can access this dashboard
  if (!teacher || teacher.role !== 'admin') {
    return <Navigate to="/teacher-login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">School Administration Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {teacher.name} - Managing {teacher.school}
            </p>
          </div>
        </div>
        
        <SchoolAdminDashboard teacher={teacher} />
      </div>
    </div>
  );
};

export default AdminDashboard;
