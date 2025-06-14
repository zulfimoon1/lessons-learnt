import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from 'react-query';

import AuthProvider from '@/contexts/AuthContext';
import SupabaseAuthProvider from '@/contexts/SupabaseAuthContext';
import LanguageProvider from '@/contexts/LanguageContext';
import PlatformAdminProvider from '@/contexts/PlatformAdminContext';

import LandingPage from '@/pages/LandingPage';
import TeacherLogin from '@/pages/TeacherLogin';
import TeacherSignup from '@/pages/TeacherSignup';
import StudentLogin from '@/pages/StudentLogin';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import PlatformAdminLogin from '@/pages/PlatformAdminLogin';
import PlatformAdminDashboard from '@/pages/PlatformAdminDashboard';
import SchoolOverview from '@/components/platform-admin/SchoolOverview';
import SecurityMonitoring from '@/components/platform-admin/SecurityMonitoring';
import EnhancedSecurityHeaders from '@/components/security/EnhancedSecurityHeaders';
import SecurityHeaders from '@/components/SecurityHeaders';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <LanguageProvider>
          <PlatformAdminProvider>
            <AuthProvider>
              <Router>
                <EnhancedSecurityHeaders />
                <SecurityHeaders />
                <Toaster />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/teacher-signup" element={<TeacherSignup />} />
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/console" element={<PlatformAdminLogin />} />
                  <Route path="/platform-admin/*" element={<PlatformAdminDashboard />} />
                </Routes>
              </Router>
            </AuthProvider>
          </PlatformAdminProvider>
        </LanguageProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
