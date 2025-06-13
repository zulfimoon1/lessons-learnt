
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlatformAdminProvider } from "@/contexts/PlatformAdminContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import PlatformAdminLogin from "./pages/PlatformAdminLogin";
import PlatformAdminDashboard from "./pages/PlatformAdminDashboard";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import HowItWorks from "./pages/HowItWorks";
import PricingPage from "./pages/PricingPage";
import PricingShowcase from "./pages/PricingShowcase";
import EnhancedPricingPage from "./pages/EnhancedPricingPage";
import AcceptInvitation from "./pages/AcceptInvitation";
import ResetPassword from "./pages/ResetPassword";
import SecureAuth from "./pages/SecureAuth";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <PlatformAdminProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing-showcase" element={<PricingShowcase />} />
                <Route path="/enhanced-pricing" element={<EnhancedPricingPage />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/platform-admin-login" element={<PlatformAdminLogin />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/secure-auth" element={<SecureAuth />} />

                {/* Protected teacher routes */}
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <ProtectedRoute userType="teacher" allowedRoles={['teacher']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected school admin routes */}
                <Route 
                  path="/school-admin-dashboard" 
                  element={
                    <ProtectedRoute userType="teacher" allowedRoles={['admin']}>
                      <SchoolAdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected admin routes (legacy - for backward compatibility) */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute userType="teacher" allowedRoles={['admin']}>
                      <SchoolAdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected student routes */}
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute userType="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Platform admin routes */}
                <Route path="/platform-admin-dashboard" element={<PlatformAdminDashboard />} />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </PlatformAdminProvider>
    </LanguageProvider>
  );
}

export default App;
