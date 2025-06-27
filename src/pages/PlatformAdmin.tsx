
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

const PlatformAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = usePlatformAdmin();

  useEffect(() => {
    console.log('PlatformAdmin: Auth check', { isAuthenticated, isLoading });
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ Platform admin authenticated, redirecting to dashboard');
        navigate('/platform-admin-dashboard');
      } else {
        console.log('❌ Platform admin not authenticated, redirecting to login');
        navigate('/platform-admin-login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="text-lg text-gray-600">Loading platform console...</span>
        </div>
      </div>
    );
  }

  // This should not be reached due to the useEffect redirect, but provide fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Platform Console</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default PlatformAdmin;
