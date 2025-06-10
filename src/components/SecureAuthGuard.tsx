
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  userType?: 'teacher' | 'student' | 'any';
}

const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  redirectTo = '/auth',
  userType = 'any'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  
  // Both auth contexts
  const { teacher, student, isLoading: authLoading } = useAuth();
  const { user: supabaseUser, teacher: supabaseTeacher, student: supabaseStudent, isLoading: supabaseLoading } = useSupabaseAuth();

  useEffect(() => {
    const checkAuth = () => {
      // Wait for both auth systems to finish loading
      if (authLoading || supabaseLoading) {
        return;
      }

      // Check if any user is authenticated
      const hasSimpleAuth = teacher || student;
      const hasSupabaseAuth = supabaseUser && (supabaseTeacher || supabaseStudent);
      const isAuthenticated = hasSimpleAuth || hasSupabaseAuth;

      console.log('SecureAuthGuard: Auth check', {
        requireAuth,
        isAuthenticated,
        hasSimpleAuth,
        hasSupabaseAuth,
        userType,
        teacher: !!teacher,
        student: !!student,
        supabaseTeacher: !!supabaseTeacher,
        supabaseStudent: !!supabaseStudent
      });

      if (requireAuth && !isAuthenticated) {
        console.log('SecureAuthGuard: User not authenticated, redirecting to:', redirectTo);
        navigate(redirectTo);
        return;
      }
      
      if (!requireAuth && isAuthenticated) {
        console.log('SecureAuthGuard: User authenticated, redirecting to dashboard');
        // Redirect to appropriate dashboard based on user type
        if (teacher || supabaseTeacher) {
          const role = teacher?.role || supabaseTeacher?.role;
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/teacher-dashboard');
          }
        } else if (student || supabaseStudent) {
          navigate('/student-dashboard');
        } else {
          navigate('/');
        }
        return;
      }
      
      // Check user type restrictions
      if (userType !== 'any' && isAuthenticated) {
        if (userType === 'teacher' && !teacher && !supabaseTeacher) {
          console.log('SecureAuthGuard: Teacher required but user is not a teacher');
          navigate('/unauthorized');
          return;
        }
        if (userType === 'student' && !student && !supabaseStudent) {
          console.log('SecureAuthGuard: Student required but user is not a student');
          navigate('/unauthorized');
          return;
        }
      }
      
      // Check role-based authorization
      if (allowedRoles.length > 0 && isAuthenticated) {
        const userRole = teacher?.role || supabaseTeacher?.role || 'student';
        if (!allowedRoles.includes(userRole)) {
          console.log('SecureAuthGuard: User role not authorized:', userRole);
          navigate('/unauthorized');
          return;
        }
      }
      
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, allowedRoles, redirectTo, navigate, teacher, student, supabaseUser, supabaseTeacher, supabaseStudent, authLoading, supabaseLoading, userType]);

  if (isLoading || authLoading || supabaseLoading) {
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
