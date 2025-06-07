
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlatformAdminProvider } from "./contexts/PlatformAdminContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const StudentLogin = React.lazy(() => import("./pages/StudentLogin"));
const TeacherLogin = React.lazy(() => import("./pages/TeacherLogin"));
const StudentDashboard = React.lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard = React.lazy(() => import("./pages/TeacherDashboard"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const PlatformAdminLogin = React.lazy(() => import("./pages/PlatformAdminLogin"));
const PlatformAdminDashboard = React.lazy(() => import("./pages/PlatformAdminDashboard"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const AcceptInvitation = React.lazy(() => import("./pages/AcceptInvitation"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  console.log('App: Rendering main App component');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PlatformAdminProvider>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Toaster />
                  <React.Suspense fallback={<LoadingSpinner />}>
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
                  </React.Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </PlatformAdminProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
