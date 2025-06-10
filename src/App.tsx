
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PlatformAdminProvider } from '@/contexts/PlatformAdminContext';
import SecureAuthGuard from '@/components/SecureAuthGuard';
import EnhancedSecurityHeaders from '@/components/EnhancedSecurityHeaders';
import AdminDashboard from '@/pages/AdminDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherLogin from '@/pages/TeacherLogin';
import StudentLogin from '@/pages/StudentLogin';
import PlatformAdminLogin from '@/pages/PlatformAdminLogin';
import PlatformAdminDashboard from '@/pages/PlatformAdminDashboard';
import HowItWorks from '@/pages/HowItWorks';
import PricingPage from '@/pages/PricingPage';
import EnhancedPricingPage from './pages/EnhancedPricingPage';
import PricingShowcase from './pages/PricingShowcase';
import Demo from '@/pages/Demo';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <PlatformAdminProvider>
              <EnhancedSecurityHeaders />
              <div className="min-h-screen bg-background">
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/console" element={<PlatformAdminLogin />} />
                  <Route path="/platform-admin" element={
                    <SecureAuthGuard requireAuth={true} userType="admin">
                      <PlatformAdminDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/teacher-login" element={
                    <SecureAuthGuard requireAuth={false}>
                      <TeacherLogin />
                    </SecureAuthGuard>
                  } />
                  <Route path="/student-login" element={
                    <SecureAuthGuard requireAuth={false}>
                      <StudentLogin />
                    </SecureAuthGuard>
                  } />
                  <Route path="/admin-dashboard" element={
                    <SecureAuthGuard userType="teacher" allowedRoles={['admin']}>
                      <AdminDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/teacher-dashboard" element={
                    <SecureAuthGuard userType="teacher">
                      <TeacherDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/student-dashboard" element={
                    <SecureAuthGuard userType="student">
                      <StudentDashboard />
                    </SecureAuthGuard>
                  } />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                  <Route path="/pricing-showcase" element={<PricingShowcase />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </PlatformAdminProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
