
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PlatformAdminProvider } from "./contexts/PlatformAdminContext";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import DemoPage from "./pages/DemoPage";
import PricingShowcase from "./pages/PricingShowcase";

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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/platform-admin" element={<PlatformAdminDashboard />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/pricing-showcase" element={<PricingShowcase />} />
              </Routes>
            </PlatformAdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
