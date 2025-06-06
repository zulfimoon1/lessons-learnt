
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolAdminLogin from "./components/SchoolAdminLogin";
import NotFound from "./pages/NotFound";

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
  const { teacher, student, schoolAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (requireTeacher && !teacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  if (requireStudent && !student) {
    return <Navigate to="/student-login" replace />;
  }

  if (requireAdmin && !schoolAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { teacher, student, schoolAdmin } = useAuth();

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
          teacher ? <Navigate to="/teacher-dashboard" replace /> : <TeacherLogin />
        } 
      />
      <Route 
        path="/admin-login" 
        element={
          schoolAdmin ? <Navigate to="/admin-dashboard" replace /> : <SchoolAdminLogin />
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
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
