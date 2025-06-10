import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/contexts/AuthContext';
import LanguageProvider from '@/contexts/LanguageContext';
import PlatformAdminProvider from '@/contexts/PlatformAdminContext';
import AdminDashboard from '@/pages/AdminDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import AuthPage from '@/pages/AuthPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import StudentSignupPage from '@/pages/StudentSignupPage';
import TeacherSignupPage from '@/pages/TeacherSignupPage';
import { QueryClient } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import PricingPage from './pages/PricingPage';
import EnhancedPricingPage from "./pages/EnhancedPricingPage";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <PlatformAdminProvider>
              <div className="min-h-screen bg-background">
                <Toaster />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="/student-signup" element={<StudentSignupPage />} />
                  <Route path="/teacher-signup" element={<TeacherSignupPage />} />
                  <Route path="/subscription-management" element={<SubscriptionManagementPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                </Routes>
              </div>
            </PlatformAdminProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
