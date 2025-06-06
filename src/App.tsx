
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlatformAdminProvider } from "./contexts/PlatformAdminContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import PricingPage from "./pages/PricingPage";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App: Rendering main App component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformAdminProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/platform-admin-login" element={<PlatformAdminLogin />} />
                  <Route path="/platform-admin-dashboard" element={<PlatformAdminDashboard />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </PlatformAdminProvider>
    </QueryClientProvider>
  );
};

export default App;
