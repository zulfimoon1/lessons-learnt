
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'teacher' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { teacher, student, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const checkAuth = () => {
      console.log('ProtectedRoute: Checking auth', { teacher, student, userType });

      // If no user is logged in, redirect to appropriate login
      if (!teacher && !student) {
        console.log('ProtectedRoute: No user authenticated, redirecting');
        const redirectTo = userType === 'student' ? '/student-login' : '/teacher-login';
        navigate(redirectTo);
        return;
      }

      // If user type is specified, check if the right type of user is logged in
      if (userType === 'teacher' && !teacher) {
        console.log('ProtectedRoute: Teacher required but student logged in, redirecting');
        navigate('/teacher-login');
        return;
      }

      if (userType === 'student' && !student) {
        console.log('ProtectedRoute: Student required but teacher logged in, redirecting');
        navigate('/student-login');
        return;
      }

      // If we get here, user is authorized
      setIsLoading(false);
    };

    checkAuth();
  }, [teacher, student, authLoading, userType, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
