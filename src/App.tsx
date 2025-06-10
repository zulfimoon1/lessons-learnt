
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlatformAdminProvider } from "./contexts/PlatformAdminContext";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import PricingPage from "./pages/PricingPage";
import AcceptInvitation from "./pages/AcceptInvitation";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import SecureAuth from "./pages/SecureAuth";
import SecureAuthGuard from "./components/SecureAuthGuard";

const queryClient = new QueryClient();

const App = () => {
  console.log('App: Rendering main App component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlatformAdminProvider>
          <SupabaseAuthProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={
                    <SecureAuthGuard requireAuth={false} redirectTo="/">
                      <SecureAuth />
                    </SecureAuthGuard>
                  } />
                  <Route path="/student-dashboard" element={
                    <SecureAuthGuard>
                      <StudentDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/teacher-dashboard" element={
                    <SecureAuthGuard>
                      <TeacherDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/admin-dashboard" element={
                    <SecureAuthGuard>
                      <AdminDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/platform-admin-login" element={<PlatformAdminLogin />} />
                  <Route path="/platform-admin-dashboard" element={<PlatformAdminDashboard />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SupabaseAuthProvider>
        </PlatformAdminProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
