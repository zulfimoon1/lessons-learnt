import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import SecurityValidationWrapper from "@/components/security/SecurityValidationWrapper";
import SecurityGuard from "@/components/auth/SecurityGuard";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Demo from "./pages/Demo";
import PricingPage from "./pages/PricingPage";
import EnhancedPricingPage from "./pages/EnhancedPricingPage";
import PricingShowcase from "./pages/PricingShowcase";
import HowItWorks from "./pages/HowItWorks";
import AcceptInvitation from "./pages/AcceptInvitation";
import SecureAuth from "./pages/SecureAuth";
import ResetPassword from "./pages/ResetPassword";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <PlatformAdminProvider>
              <SecurityValidationWrapper
                validationRules={{
                  maxInputLength: 1000,
                  enableRateLimit: true,
                  logSecurityEvents: true
                }}
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                  <Route path="/pricing-showcase" element={<PricingShowcase />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="/secure-auth" element={<SecureAuth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Platform Admin Routes with Enhanced Security */}
                  <Route 
                    path="/console" 
                    element={
                      <SecurityGuard requireAuth={false}>
                        <PlatformAdminLogin />
                      </SecurityGuard>
                    } 
                  />
                  <Route 
                    path="/platform-admin" 
                    element={
                      <SecurityGuard requireAuth={true} userType="admin">
                        <PlatformAdminDashboard />
                      </SecurityGuard>
                    } 
                  />
                  
                  {/* Teacher Routes with Security */}
                  <Route 
                    path="/teacher-dashboard" 
                    element={
                      <SecurityGuard requireAuth={true} userType="teacher">
                        <TeacherDashboard />
                      </SecurityGuard>
                    } 
                  />
                  <Route 
                    path="/admin-dashboard" 
                    element={
                      <SecurityGuard 
                        requireAuth={true} 
                        userType="teacher" 
                        allowedRoles={['admin']}
                      >
                        <AdminDashboard />
                      </SecurityGuard>
                    } 
                  />
                  
                  {/* Student Routes with Security */}
                  <Route 
                    path="/student-dashboard" 
                    element={
                      <SecurityGuard requireAuth={true} userType="student">
                        <StudentDashboard />
                      </SecurityGuard>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SecurityValidationWrapper>
            </PlatformAdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
