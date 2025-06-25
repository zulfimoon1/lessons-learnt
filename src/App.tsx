
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import WeeklySummary from "./pages/WeeklySummary";
import ClassFeedback from "./pages/ClassFeedback";
import PlatformAdmin from "./pages/PlatformAdmin";
import Demo from "./pages/Demo";
import PricingShowcase from "./pages/PricingShowcase";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import SOC2CompliancePage from "./pages/SOC2CompliancePage";
import SOC2TestPage from "./pages/SOC2TestPage";
import SOC2Monitor from "./components/soc2/SOC2Monitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SOC2Monitor>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/weekly-summary" element={<WeeklySummary />} />
              <Route path="/feedback/:scheduleId" element={<ClassFeedback />} />
              <Route path="/platform-admin" element={<PlatformAdmin />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/pricing-showcase" element={<PricingShowcase />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/privacy-dashboard" element={<PrivacyDashboard />} />
              <Route path="/soc2-compliance" element={<SOC2CompliancePage />} />
              <Route path="/soc2-test" element={<SOC2TestPage />} />
            </Routes>
          </SOC2Monitor>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
