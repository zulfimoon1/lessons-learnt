
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securityService } from '@/services/securityService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface SecurityGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'teacher' | 'student' | 'admin';
  allowedRoles?: string[];
  redirectTo?: string;
}

const SecurityGuard: React.FC<SecurityGuardProps> = ({ 
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
  const location = useLocation();
  const { teacher, student, isLoading: authLoading } = useAuth();
  const { admin, isLoading: adminLoading, isAuthenticated: adminAuthenticated } = usePlatformAdmin();

  useEffect(() => {
    if (authLoading || adminLoading) return;

    const checkSecurity = async () => {
      try {
        // If platform admin is authenticated, grant access to everything
        if (adminAuthenticated && admin) {
          console.log('Platform admin authenticated, granting full access');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Validate session for regular users
        const isValidSession = await securityService.validateSession();
        if (requireAuth && !isValidSession && !admin) {
          securityService.logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: `Session validation failed for ${location.pathname}`,
            userAgent: navigator.userAgent
          });
          setSecurityError('Session expired. Please log in again.');
          navigate('/teacher-login');
          return;
        }

        // Check authentication requirements
        if (requireAuth && !teacher && !student && !admin) {
          securityService.logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: `Unauthorized access attempt to ${location.pathname}`,
            userAgent: navigator.userAgent
          });
          
          const defaultRedirect = userType === 'student' ? '/student-login' : '/teacher-login';
          navigate(redirectTo || defaultRedirect);
          return;
        }

        // Check user type requirements (platform admin bypasses all checks)
        if (userType === 'teacher' && !teacher && !admin) {
          securityService.logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: `Teacher required but student logged in for ${location.pathname}`,
            userAgent: navigator.userAgent
          });
          navigate('/teacher-login');
          return;
        }

        if (userType === 'student' && !student && !admin) {
          securityService.logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: `Student required but teacher logged in for ${location.pathname}`,
            userAgent: navigator.userAgent
          });
          navigate('/student-login');
          return;
        }

        if (userType === 'admin' && !admin) {
          securityService.logSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: `Admin required but not logged in for ${location.pathname}`,
            userAgent: navigator.userAgent
          });
          navigate('/console');
          return;
        }

        // Check role-based access for teachers (platform admin bypasses)
        if (allowedRoles.length > 0 && teacher && !admin) {
          if (!allowedRoles.includes(teacher.role)) {
            securityService.logSecurityEvent({
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

        // Check for suspicious access patterns (skip for platform admin)
        if (!admin) {
          const suspiciousActivity = securityService.detectConcurrentSessions();
          if (suspiciousActivity) {
            setSecurityError('Suspicious activity detected. Please verify your session.');
            // Don't redirect, just show warning
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Security check failed:', error);
        securityService.logSecurityEvent({
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

    checkSecurity();
  }, [teacher, student, admin, adminAuthenticated, authLoading, adminLoading, requireAuth, userType, allowedRoles, redirectTo, navigate, location.pathname]);

  if (authLoading || adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Security Verification
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

export default SecurityGuard;
