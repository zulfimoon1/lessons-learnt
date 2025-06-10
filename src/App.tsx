

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PlatformAdminDashboard from './pages/PlatformAdminDashboard';
import SecurityHeaders from './components/SecurityHeaders';
import { Toaster } from "@/components/ui/toaster"
import EnhancedSecurityHeaders from "./components/EnhancedSecurityHeaders";
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <EnhancedSecurityHeaders />
        <SecurityHeaders />
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/admin" element={<PlatformAdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </LanguageProvider>
  );
}

export default App;

