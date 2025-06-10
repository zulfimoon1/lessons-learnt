
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securityService } from '@/services/securityService';
import { secureSessionService } from '@/services/secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'teacher' | 'student' | 'admin';
  allowedRoles?: string[];
  redirectTo?: string;
}

const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  userType,
  allowedRoles = [],
  redirectTo 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { teacher, student, isLoading: authLoading } = useAuth();
  const { admin, isLoading: adminLoading } = usePlatformAdmin();

  useEffect(() => {
    if (authLoading || adminLoading) return;

    const checkAuth = async () => {
      try {
        console.log('SecureAuthGuard: Enhanced security check', { teacher, student, admin, userType, requireAuth });

        // Perform security validation
        const sessionValid = secureSessionService.checkSessionValidity();
        if (!sessionValid && (teacher || student)) {
          logUserSecurityEvent({
            type: 'session_error',
            timestamp: new Date().toISOString(),
            details: 'Session validity check failed',
            userAgent: navigator.userAgent
          });
          setSecurityError('Session security validation failed. Please log in again.');
          navigate('/teacher-login');
          return;
        }

        // Check for concurrent sessions
        const concurrentSessions = secureSessionService.detectConcurrentSessions();
        if (concurrentSessions) {
          setSecurityError('Multiple active sessions detected. For security reasons, please verify your identity.');
        }

        // Handle platform admin authentication
        if (userType === 'admin') {
          if (!admin) {
            console.log('SecureAuthGuard: Admin required but not logged in, redirecting');
            logUserSecurityEvent({
              type: 'unauthorized_access',
              timestamp: new Date().toISOString(),
              details: 'Unauthorized access attempt to admin area',
              userAgent: navigator.userAgent
            });
            navigate('/console');
            return;
          }
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // If auth is not required and no user is logged in, allow access
        if (!requireAuth && !teacher && !student && !admin) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // If auth is required but no user is logged in, redirect to appropriate login
        if (requireAuth && !teacher && !student && !admin) {
          console.log('SecureAuthGuard: Authentication required but no user authenticated, redirecting');
          logUserSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: 'Authentication required but user not logged in',
            userAgent: navigator.userAgent
          });
          
          const defaultRedirect = userType === 'student' ? '/student-login' : '/teacher-login';
          navigate(redirectTo || defaultRedirect);
          return;
        }

        // If user type is specified, check if the right type of user is logged in
        if (userType === 'teacher' && !teacher) {
          console.log('SecureAuthGuard: Teacher required but student logged in, redirecting');
          logUserSecurityEvent({
            type: 'unauthorized_access',
            userId: student?.id,
            timestamp: new Date().toISOString(),
            details: 'Teacher access required but student logged in',
            userAgent: navigator.userAgent
          });
          navigate('/teacher-login');
          return;
        }

        if (userType === 'student' && !student) {
          console.log('SecureAuthGuard: Student required but teacher logged in, redirecting');
          logUserSecurityEvent({
            type: 'unauthorized_access',
            userId: teacher?.id,
            timestamp: new Date().toISOString(),
            details: 'Student access required but teacher logged in',
            userAgent: navigator.userAgent
          });
          navigate('/student-login');
          return;
        }

        // Check role-based access for teachers
        if (allowedRoles.length > 0 && teacher) {
          if (!allowedRoles.includes(teacher.role)) {
            console.log('SecureAuthGuard: Teacher role not authorized:', teacher.role);
            logUserSecurityEvent({
              type: 'unauthorized_access',
              userId: teacher.id,
              timestamp: new Date().toISOString(),
              details: `Role-based access denied. Required: ${allowedRoles.join(', ')}, User role: ${teacher.role}`,
              userAgent: navigator.userAgent
            });
            navigate('/teacher-dashboard');
            return;
          }
        }

        // Additional security monitoring
        await securityService.detectSuspiciousActivity?.();

        // If we get here, user is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('SecureAuthGuard: Security check failed:', error);
        logUserSecurityEvent({
          type: 'session_error',
          timestamp: new Date().toISOString(),
          details: `Security guard error: ${error}`,
          userAgent: navigator.userAgent
        });
        setSecurityError('Security verification failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [teacher, student, admin, authLoading, adminLoading, requireAuth, userType, allowedRoles, redirectTo, navigate]);

  if (authLoading || adminLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Enhanced Security Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Verifying security credentials...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (securityError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Security Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{securityError}</p>
            {isAuthorized && children}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default SecureAuthGuard;
