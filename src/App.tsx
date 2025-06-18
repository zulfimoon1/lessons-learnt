
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SecurePlatformAdminProvider } from "@/contexts/SecurePlatformAdminContext";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SecureAuth from "./pages/SecureAuth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <SecurePlatformAdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/secure-auth" element={<SecureAuth />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route 
                path="/teacher-dashboard" 
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute userType="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/console" 
                element={
                  <ProtectedRoute userType="admin">
                    <SecureAuth />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SecurePlatformAdminProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
