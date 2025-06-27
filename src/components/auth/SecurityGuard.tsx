
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

  // Safe platform admin context access - prevent circular imports
  let admin = null;
  let adminAuthenticated = false;
  let adminLoading = false;

  try {
    // Only import if we're dealing with admin routes
    if (userType === 'admin' || location.pathname.includes('platform-admin')) {
      const { usePlatformAdmin } = require('@/contexts/PlatformAdminContext');
      const platformAdminContext = usePlatformAdmin();
      admin = platformAdminContext?.admin;
      adminAuthenticated = platformAdminContext?.isAuthenticated || false;
      adminLoading = platformAdminContext?.isLoading || false;
    }
  } catch (error) {
    console.log('Platform admin context not available, proceeding with regular auth');
  }

  useEffect(() => {
    console.log('SecurityGuard: Auth state check', { 
      authLoading, 
      adminLoading, 
      teacher: !!teacher, 
      student: !!student, 
      admin: !!admin, 
      adminAuthenticated,
      userType,
      requireAuth,
      pathname: location.pathname
    });

    if (authLoading || adminLoading) return;

    const checkSecurity = async () => {
      try {
        // Platform admin has access to everything
        if (admin && adminAuthenticated) {
          console.log('✅ Platform admin authenticated, granting full access');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // If specifically requiring admin access and not platform admin, redirect
        if (userType === 'admin' && (!admin || !adminAuthenticated)) {
          console.log('❌ Admin required but not platform admin, redirecting to /console');
          navigate('/console');
          return;
        }

        // For regular users, check normal auth flow
        if (requireAuth && !teacher && !student && !admin) {
          console.log('❌ No user authenticated, redirecting to login');
          const defaultRedirect = userType === 'student' ? '/student-login' : '/teacher-login';
          navigate(redirectTo || defaultRedirect);
          return;
        }

        // Check user type requirements (platform admin bypasses all checks)
        if (userType === 'teacher' && !teacher && !admin) {
          console.log('❌ Teacher required but not authenticated');
          navigate('/teacher-login');
          return;
        }

        if (userType === 'student' && !student && !admin) {
          console.log('❌ Student required but not authenticated');
          navigate('/student-login');
          return;
        }

        // Check role-based access for teachers (platform admin bypasses)
        if (allowedRoles.length > 0 && teacher && !admin) {
          if (!allowedRoles.includes(teacher.role)) {
            console.log('❌ Role-based access denied for role:', teacher.role);
            navigate('/teacher-dashboard');
            return;
          }
        }

        console.log('✅ Security check passed');
        setIsAuthorized(true);
      } catch (error) {
        console.error('💥 Security check failed:', error);
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
