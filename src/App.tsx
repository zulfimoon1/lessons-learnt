
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PlatformAdminProvider } from '@/contexts/PlatformAdminContext';
import SecureAuthGuard from '@/components/SecureAuthGuard';
import AdminDashboard from '@/pages/AdminDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import TeacherLogin from '@/pages/TeacherLogin';
import StudentLogin from '@/pages/StudentLogin';
import SecureAuth from '@/pages/SecureAuth';
import Unauthorized from '@/pages/Unauthorized';
import PricingPage from '@/pages/PricingPage';
import EnhancedPricingPage from './pages/EnhancedPricingPage';
import PricingShowcase from './pages/PricingShowcase';
import Demo from '@/pages/Demo';
import Index from '@/pages/Index';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SupabaseAuthProvider>
          <AuthProvider>
            <LanguageProvider>
              <PlatformAdminProvider>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route 
                      path="/teacher-login" 
                      element={
                        <SecureAuthGuard requireAuth={false}>
                          <TeacherLogin />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route 
                      path="/student-login" 
                      element={
                        <SecureAuthGuard requireAuth={false}>
                          <StudentLogin />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route 
                      path="/auth" 
                      element={
                        <SecureAuthGuard requireAuth={false}>
                          <SecureAuth />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route 
                      path="/admin-dashboard" 
                      element={
                        <SecureAuthGuard requireAuth={true} allowedRoles={['admin']} userType="teacher">
                          <AdminDashboard />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route 
                      path="/teacher-dashboard" 
                      element={
                        <SecureAuthGuard requireAuth={true} userType="teacher">
                          <TeacherDashboard />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route 
                      path="/student-dashboard" 
                      element={
                        <SecureAuthGuard requireAuth={true} userType="student">
                          <StudentDashboard />
                        </SecureAuthGuard>
                      } 
                    />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                    <Route path="/pricing-showcase" element={<PricingShowcase />} />
                  </Routes>
                </div>
              </PlatformAdminProvider>
            </LanguageProvider>
          </AuthProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
