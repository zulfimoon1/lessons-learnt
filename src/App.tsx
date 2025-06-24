
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafeLanguageProvider } from "@/contexts/SafeLanguageContext";
import { SafeAuthProvider } from "@/contexts/SafeAuthContext";
import { useSystemPreservation } from "@/hooks/useSystemPreservation";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SecureAuth from "./pages/SecureAuth";
import SecureTeacherLogin from "./pages/SecureTeacherLogin";
import SecureStudentLogin from "./pages/SecureStudentLogin";

const queryClient = new QueryClient();

// Core system monitoring component
const SystemMonitor = () => {
  useSystemPreservation();
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeLanguageProvider>
        <SafeAuthProvider>
          <TooltipProvider>
            <SystemMonitor />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/secure-auth" element={<SecureAuth />} />
                <Route path="/secure-teacher-login" element={<SecureTeacherLogin />} />
                <Route path="/secure-student-login" element={<SecureStudentLogin />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SafeAuthProvider>
      </SafeLanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
