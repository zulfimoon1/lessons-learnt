
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SecureAuthProvider } from "@/contexts/SecureAuthContext";
import Index from "./pages/Index";
import SecureStudentLogin from "./pages/SecureStudentLogin";
import SecureTeacherLogin from "./pages/SecureTeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PricingPage from "./pages/PricingPage";
import HowItWorks from "./pages/HowItWorks";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <SecureAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/student-login" element={<SecureStudentLogin />} />
              <Route path="/teacher-login" element={<SecureTeacherLogin />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SecureAuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
