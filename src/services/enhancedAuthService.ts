
import { supabase } from '@/integrations/supabase/client';
import { secureStudentLogin, secureStudentSignup } from './secureStudentAuthService';
import { secureTeacherLogin, secureTeacherSignup } from './secureAuthService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Unified authentication service with enhanced security
class EnhancedAuthService {
  
  // Student authentication with enhanced security
  async authenticateStudent(fullName: string, school: string, grade: string, password: string) {
    try {
      logUserSecurityEvent({
        type: 'login_success',
        timestamp: new Date().toISOString(),
        details: `Enhanced student authentication attempt for: ${fullName}`,
        userAgent: navigator.userAgent
      });

      return await secureStudentLogin(fullName, school, grade, password);
    } catch (error) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Enhanced student authentication error: ${error}`,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Student registration with enhanced security
  async registerStudent(fullName: string, school: string, grade: string, password: string) {
    try {
      logUserSecurityEvent({
        type: 'login_success',
        timestamp: new Date().toISOString(),
        details: `Enhanced student registration attempt for: ${fullName}`,
        userAgent: navigator.userAgent
      });

      return await secureStudentSignup(fullName, school, grade, password);
    } catch (error) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Enhanced student registration error: ${error}`,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Teacher authentication with enhanced security
  async authenticateTeacher(email: string, password: string) {
    try {
      logUserSecurityEvent({
        type: 'login_success',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher authentication attempt for: ${email}`,
        userAgent: navigator.userAgent
      });

      return await secureTeacherLogin(email, password);
    } catch (error) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher authentication error: ${error}`,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Teacher registration with enhanced security
  async registerTeacher(name: string, email: string, school: string, password: string, role: string = 'teacher') {
    try {
      logUserSecurityEvent({
        type: 'login_success',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher registration attempt for: ${email}`,
        userAgent: navigator.userAgent
      });

      return await secureTeacherSignup(name, email, school, password, role);
    } catch (error) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher registration error: ${error}`,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Secure logout with audit logging
  async secureLogout(userId?: string, userType?: string) {
    try {
      if (userId) {
        logUserSecurityEvent({
          type: 'logout',
          userId: userId,
          timestamp: new Date().toISOString(),
          details: `Enhanced secure logout for ${userType || 'user'}`,
          userAgent: navigator.userAgent
        });
      }

      // Clear all sensitive data
      localStorage.removeItem('student');
      localStorage.removeItem('teacher');
      localStorage.removeItem('platformAdmin');
      sessionStorage.clear();
      
      console.log('Enhanced secure logout completed');
    } catch (error) {
      console.error('Enhanced secure logout error:', error);
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Enhanced secure logout error: ${error}`,
        userAgent: navigator.userAgent
      });
    }
  }

  // Security validation helper
  validateSecurityContext(userId: string, requiredRole?: string): boolean {
    try {
      // Check if user has valid session
      const student = localStorage.getItem('student');
      const teacher = localStorage.getItem('teacher');
      
      if (student) {
        const studentData = JSON.parse(student);
        return studentData.id === userId && (!requiredRole || requiredRole === 'student');
      }
      
      if (teacher) {
        const teacherData = JSON.parse(teacher);
        return teacherData.id === userId && (!requiredRole || teacherData.role === requiredRole);
      }
      
      return false;
    } catch (error) {
      logUserSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Security context validation error: ${error}`,
        userAgent: navigator.userAgent
      });
      return false;
    }
  }
}

export const enhancedAuthService = new EnhancedAuthService();

// Export individual functions for backward compatibility
export const studentLoginService = (fullName: string, school: string, grade: string, password: string) =>
  enhancedAuthService.authenticateStudent(fullName, school, grade, password);

export const studentSignupService = (fullName: string, school: string, grade: string, password: string) =>
  enhancedAuthService.registerStudent(fullName, school, grade, password);

export const teacherEmailLoginService = (email: string, password: string) =>
  enhancedAuthService.authenticateTeacher(email, password);

export const teacherSignupService = (name: string, email: string, school: string, password: string, role?: string) =>
  enhancedAuthService.registerTeacher(name, email, school, password, role);
