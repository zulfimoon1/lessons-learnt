
import React from 'react';
import SecureProtectedRoute from './SecureProtectedRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'teacher' | 'student' | 'admin';
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  return <SecureProtectedRoute {...props} />;
};

export default ProtectedRoute;
