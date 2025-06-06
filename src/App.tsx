import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlatformAdminProvider, usePlatformAdmin } from "./contexts/PlatformAdminContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import NotFound from "./pages/NotFound";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requireTeacher?: boolean; 
  requireStudent?: boolean;
  requireAdmin?: boolean;
}> = ({ 
  children, 
  requireTeacher = false, 
  requireStudent = false,
  requireAdmin = false
}) => {
  const { teacher, student, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (requireTeacher && !teacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  if (requireStudent && !student) {
    return <Navigate to="/student-login" replace />;
  }

  if (requireAdmin && (!teacher || teacher.role !== 'admin')) {
    return <Navigate to="/teacher-login" replace />;
  }

  return <>{children}</>;
};

const PlatformAdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = usePlatformAdmin();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!admin) {
    return <Navigate to="/platform-admin-login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { teacher, student } = useAuth();
  const { admin } = usePlatformAdmin();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/student-login" 
        element={
          student ? <Navigate to="/student-dashboard" replace /> : <StudentLogin />
        } 
      />
      <Route 
        path="/teacher-login" 
        element={
          teacher ? (
            teacher.role === 'admin' ? 
              <Navigate to="/admin-dashboard" replace /> : 
              <Navigate to="/teacher-dashboard" replace />
          ) : <TeacherLogin />
        } 
      />
      <Route 
        path="/platform-admin-login" 
        element={
          admin ? <Navigate to="/platform-admin" replace /> : <PlatformAdminLogin />
        } 
      />
      <Route 
        path="/teacher-dashboard" 
        element={
          <ProtectedRoute requireTeacher>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student-dashboard" 
        element={
          <ProtectedRoute requireStudent>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/platform-admin" 
        element={
          <PlatformAdminProtectedRoute>
            <PlatformAdminDashboard />
          </PlatformAdminProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <PlatformAdminProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </PlatformAdminProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
