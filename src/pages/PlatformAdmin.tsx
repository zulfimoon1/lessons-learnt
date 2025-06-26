
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

const PlatformAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = usePlatformAdmin();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If already authenticated, redirect to dashboard
        navigate('/platform-admin-dashboard');
      } else {
        // If not authenticated, redirect to login
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
  return null;
};

export default PlatformAdmin;
