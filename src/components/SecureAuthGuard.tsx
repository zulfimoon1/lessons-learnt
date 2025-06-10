
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  redirectTo = '/auth' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      
      if (requireAuth && !user) {
        console.log('SecureAuthGuard: User not authenticated, redirecting to:', redirectTo);
        navigate(redirectTo);
        return;
      }
      
      if (!requireAuth && user) {
        console.log('SecureAuthGuard: User authenticated, redirecting to dashboard');
        navigate('/');
        return;
      }
      
      if (allowedRoles.length > 0 && user) {
        if (!allowedRoles.includes(user.role)) {
          console.log('SecureAuthGuard: User role not authorized:', user.role);
          navigate('/unauthorized');
          return;
        }
      }
      
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, allowedRoles, redirectTo, navigate]);

  if (isLoading) {
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
