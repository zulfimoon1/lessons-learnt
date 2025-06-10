
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PlatformAdminProvider } from '@/contexts/PlatformAdminContext';
import AdminDashboard from '@/pages/AdminDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
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
        <AuthProvider>
          <LanguageProvider>
            <PlatformAdminProvider>
              <div className="min-h-screen bg-background">
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                  <Route path="/pricing-showcase" element={<PricingShowcase />} />
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
