
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { PlatformAdminProvider } from "./contexts/PlatformAdminContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SecureAuthProvider } from "./components/security/SecureAuthProvider";
import SecurityHeaders from "./components/security/SecurityHeaders";
import EnhancedSecurityMonitor from "./components/security/EnhancedSecurityMonitor";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import PlatformConsole from "./pages/PlatformConsole";
import SecureAuth from "./pages/SecureAuth";
import SecureAuthGuard from "./components/SecureAuthGuard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SecurityHeaders />
          <LanguageProvider>
            <SupabaseAuthProvider>
              <SecureAuthProvider>
                <AuthProvider>
                  <PlatformAdminProvider>
                    <div className="min-h-screen bg-gray-50">
                      {/* Security Monitor - Only show to authenticated users */}
                      <div className="fixed top-4 right-4 z-50 w-80">
                        <EnhancedSecurityMonitor />
                      </div>
                      
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/teacher-login" element={<TeacherLogin />} />
                        <Route path="/student-login" element={<StudentLogin />} />
                        <Route path="/secure-auth" element={<SecureAuth />} />
                        
                        <Route 
                          path="/teacher-dashboard" 
                          element={
                            <SecureAuthGuard requireAuth userType="teacher">
                              <TeacherDashboard />
                            </SecureAuthGuard>
                          } 
                        />
                        
                        <Route 
                          path="/student-dashboard" 
                          element={
                            <SecureAuthGuard requireAuth userType="student">
                              <StudentDashboard />
                            </SecureAuthGuard>
                          } 
                        />
                        
                        <Route 
                          path="/console" 
                          element={
                            <SecureAuthGuard requireAuth userType="admin">
                              <PlatformConsole />
                            </SecureAuthGuard>
                          } 
                        />
                      </Routes>
                    </div>
                  </PlatformAdminProvider>
                </AuthProvider>
              </SecureAuthProvider>
            </SupabaseAuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
