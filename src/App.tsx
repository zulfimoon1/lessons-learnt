
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import SecurityGuard from "@/components/auth/SecurityGuard";
import SecurityHeadersProvider from "@/components/security/SecurityHeadersProvider";
import { Suspense, lazy } from "react";
// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const TeacherLogin = lazy(() => import("./pages/TeacherLogin"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
const PlatformAdminLogin = lazy(() => import("./pages/PlatformAdminLogin"));
const PlatformAdminDashboard = lazy(() => import("./pages/PlatformAdminDashboard"));
const ClassFeedback = lazy(() => import("./pages/ClassFeedback"));
const WeeklySummary = lazy(() => import("./pages/WeeklySummary"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const SecureAuth = lazy(() => import("./pages/SecureAuth"));
const SecureStudentLogin = lazy(() => import("./pages/SecureStudentLogin"));
const SecureTeacherLogin = lazy(() => import("./pages/SecureTeacherLogin"));
const Demo = lazy(() => import("./pages/Demo"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const EnhancedPricingPage = lazy(() => import("./pages/EnhancedPricingPage"));
const PricingShowcase = lazy(() => import("./pages/PricingShowcase"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const PrivacyDashboard = lazy(() => import("./pages/PrivacyDashboard"));
const HIPAACompliancePage = lazy(() => import("./pages/HIPAACompliancePage"));
const SOC2CompliancePage = lazy(() => import("./pages/SOC2CompliancePage"));
const SOC2TestPage = lazy(() => import("./pages/SOC2TestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <PlatformAdminProvider>
            <TooltipProvider>
              <SecurityHeadersProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background">
                    <Suspense fallback={<PageLoader />}>
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
                    </Suspense>
                  </div>
                  <Sonner />
                </BrowserRouter>
              </SecurityHeadersProvider>
            </TooltipProvider>
          </PlatformAdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
