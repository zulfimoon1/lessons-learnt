import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PlatformAdminDashboard from './pages/PlatformAdminDashboard';
import SecurityHeaders from './components/SecurityHeaders';
import { Toaster } from "@/components/ui/toaster"
import EnhancedSecurityHeaders from "./components/EnhancedSecurityHeaders";

function App() {
  return (
    <Router>
      <EnhancedSecurityHeaders />
      <SecurityHeaders />
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<PlatformAdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
