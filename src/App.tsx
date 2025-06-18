
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SecurePlatformAdminProvider } from "@/contexts/SecurePlatformAdminContext";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SecureAuth from "./pages/SecureAuth";
import Demo from "./pages/Demo";
import PricingShowcase from "./pages/PricingShowcase";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <SupabaseAuthProvider>
            <SecurePlatformAdminProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/pricing-showcase" element={<PricingShowcase />} />
                    <Route path="/secure-auth" element={<SecureAuth />} />
                    <Route path="/console" element={<SecureAuth />} />
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
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SecurePlatformAdminProvider>
          </SupabaseAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
