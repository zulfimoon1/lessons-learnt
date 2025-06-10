
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

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
  const navigate = useNavigate();
  const { teacher, student, isLoading: authLoading } = useAuth();
  const { admin, isLoading: adminLoading } = usePlatformAdmin();

  useEffect(() => {
    if (authLoading || adminLoading) return;

    const checkAuth = () => {
      console.log('SecureAuthGuard: Checking auth', { teacher, student, admin, userType, requireAuth });

      // Handle platform admin authentication
      if (userType === 'admin') {
        if (!admin) {
          console.log('SecureAuthGuard: Admin required but not logged in, redirecting');
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
        console.log('SecureAuthGuard: No user authenticated, redirecting');
        const defaultRedirect = userType === 'student' ? '/student-login' : '/teacher-login';
        navigate(redirectTo || defaultRedirect);
        return;
      }

      // If user type is specified, check if the right type of user is logged in
      if (userType === 'teacher' && !teacher) {
        console.log('SecureAuthGuard: Teacher required but student logged in, redirecting');
        navigate('/teacher-login');
        return;
      }

      if (userType === 'student' && !student) {
        console.log('SecureAuthGuard: Student required but teacher logged in, redirecting');
        navigate('/student-login');
        return;
      }

      // Check role-based access for teachers
      if (allowedRoles.length > 0 && teacher) {
        if (!allowedRoles.includes(teacher.role)) {
          console.log('SecureAuthGuard: Teacher role not authorized:', teacher.role);
          navigate('/teacher-dashboard');
          return;
        }
      }

      // If we get here, user is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [teacher, student, admin, authLoading, adminLoading, requireAuth, userType, allowedRoles, redirectTo, navigate]);

  if (authLoading || adminLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default SecureAuthGuard;
