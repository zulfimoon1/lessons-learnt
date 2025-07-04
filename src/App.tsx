
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import SecurityGuard from "@/components/auth/SecurityGuard";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdmin from "./pages/PlatformAdmin";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import ClassFeedback from "./pages/ClassFeedback";
import WeeklySummary from "./pages/WeeklySummary";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvitation from "./pages/AcceptInvitation";
import SecureAuth from "./pages/SecureAuth";
import SecureStudentLogin from "./pages/SecureStudentLogin";
import SecureTeacherLogin from "./pages/SecureTeacherLogin";
import Demo from "./pages/Demo";
import PricingPage from "./pages/PricingPage";
import EnhancedPricingPage from "./pages/EnhancedPricingPage";
import PricingShowcase from "./pages/PricingShowcase";
import HowItWorks from "./pages/HowItWorks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import HIPAACompliancePage from "./pages/HIPAACompliancePage";
import SOC2CompliancePage from "./pages/SOC2CompliancePage";
import SOC2TestPage from "./pages/SOC2TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <PlatformAdminProvider>
            <TooltipProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/teacher-login" element={<TeacherLogin />} />
                    <Route path="/secure-auth" element={<SecureAuth />} />
                    <Route path="/secure-student-login" element={<SecureStudentLogin />} />
                    <Route path="/secure-teacher-login" element={<SecureTeacherLogin />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                    <Route path="/pricing-showcase" element={<PricingShowcase />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/privacy-policy-page" element={<PrivacyPolicyPage />} />
                    <Route path="/privacy-dashboard" element={<PrivacyDashboard />} />
                    <Route path="/hipaa-compliance" element={<HIPAACompliancePage />} />
                    <Route path="/soc2-compliance" element={<SOC2CompliancePage />} />
                    <Route path="/soc2-test" element={<SOC2TestPage />} />
                    
                    {/* Platform Admin Routes - No SecurityGuard to prevent loops */}
                    <Route path="/console" element={<PlatformAdminLogin />} />
                    <Route path="/platform-admin" element={<PlatformAdmin />} />
                    <Route path="/platform-admin-login" element={<PlatformAdminLogin />} />
                    <Route path="/platform-admin-dashboard" element={<PlatformAdminDashboard />} />
                    
                    {/* Protected Routes with SecurityGuard */}
                    <Route path="/student-dashboard" element={
                      <SecurityGuard userType="student">
                        <StudentDashboard />
                      </SecurityGuard>
                    } />
                    <Route path="/teacher-dashboard" element={
                      <SecurityGuard userType="teacher">
                        <TeacherDashboard />
                      </SecurityGuard>
                    } />
                    <Route path="/admin-dashboard" element={
                      <SecurityGuard userType="teacher" allowedRoles={['admin']}>
                        <AdminDashboard />
                      </SecurityGuard>
                    } />
                    <Route path="/class-feedback/:scheduleId" element={
                      <SecurityGuard userType="student">
                        <ClassFeedback />
                      </SecurityGuard>
                    } />
                    <Route path="/weekly-summary" element={
                      <SecurityGuard userType="student">
                        <WeeklySummary />
                      </SecurityGuard>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Sonner />
              </BrowserRouter>
            </TooltipProvider>
          </PlatformAdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
