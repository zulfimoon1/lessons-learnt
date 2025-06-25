import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassFeedback from "./pages/ClassFeedback";
import WeeklySummary from "./pages/WeeklySummary";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdmin from "./pages/PlatformAdmin";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import AcceptInvitation from "./pages/AcceptInvitation";
import ResetPassword from "./pages/ResetPassword";
import SecureAuth from "./pages/SecureAuth";
import SecureStudentLogin from "./pages/SecureStudentLogin";
import SecureTeacherLogin from "./pages/SecureTeacherLogin";
import Demo from "./pages/Demo";
import HowItWorks from "./pages/HowItWorks";
import PricingPage from "./pages/PricingPage";
import EnhancedPricingPage from "./pages/EnhancedPricingPage";
import PricingShowcase from "./pages/PricingShowcase";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import SOC2CompliancePage from "./pages/SOC2CompliancePage";
import SOC2TestPage from "./pages/SOC2TestPage";
import HIPAACompliancePage from "./pages/HIPAACompliancePage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AuthProvider>
                <PlatformAdminProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/teacher-login" element={<TeacherLogin />} />
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    <Route path="/class-feedback/:teacherId/:classId" element={<ClassFeedback />} />
                    <Route path="/weekly-summary" element={<WeeklySummary />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/platform-admin" element={<PlatformAdmin />} />
                    <Route path="/platform-admin-login" element={<PlatformAdminLogin />} />
                    <Route path="/platform-admin-dashboard" element={<PlatformAdminDashboard />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/secure-auth" element={<SecureAuth />} />
                    <Route path="/secure-student-login" element={<SecureStudentLogin />} />
                    <Route path="/secure-teacher-login" element={<SecureTeacherLogin />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                    <Route path="/pricing-showcase" element={<PricingShowcase />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/privacy-policy-page" element={<PrivacyPolicyPage />} />
                    <Route path="/privacy-dashboard" element={<PrivacyDashboard />} />
                    <Route path="/soc2-compliance" element={<SOC2CompliancePage />} />
                    <Route path="/soc2-test" element={<SOC2TestPage />} />
                    <Route path="/hipaa-compliance" element={<HIPAACompliancePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PlatformAdminProvider>
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
