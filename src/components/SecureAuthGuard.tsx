
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}) => {
  const { user, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        console.log('SecureAuthGuard: User not authenticated, redirecting to:', redirectTo);
        navigate(redirectTo);
      } else if (!requireAuth && user) {
        console.log('SecureAuthGuard: User authenticated, redirecting to dashboard');
        navigate('/');
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
};

export default SecureAuthGuard;
