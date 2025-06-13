
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'teacher' | 'student';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, student, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const checkSecurity = () => {
      try {
        console.log('SecurityGuard: Simple auth check', { teacher, student, requireAuth, userType });

        // Check authentication requirements
        if (requireAuth && !teacher && !student) {
          console.log('SecurityGuard: No user authenticated, redirecting');
          const defaultRedirect = userType === 'student' ? '/student-login' : '/teacher-login';
          navigate(redirectTo || defaultRedirect);
          return;
        }

        // Check user type requirements
        if (userType === 'teacher' && !teacher) {
          console.log('SecurityGuard: Teacher required but student logged in, redirecting');
          navigate('/teacher-login');
          return;
        }

        if (userType === 'student' && !student) {
          console.log('SecurityGuard: Student required but teacher logged in, redirecting');
          navigate('/student-login');
          return;
        }

        // Check role-based access for teachers
        if (allowedRoles.length > 0 && teacher) {
          if (!allowedRoles.includes(teacher.role)) {
            console.log('SecurityGuard: Teacher role not authorized:', teacher.role);
            navigate('/teacher-dashboard');
            return;
          }
        }

        console.log('SecurityGuard: Access granted');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Security check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSecurity();
  }, [teacher, student, authLoading, requireAuth, userType, allowedRoles, redirectTo, navigate, location.pathname]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default SecurityGuard;
