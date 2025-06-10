
import React from 'react';
import SecurityGuard from './auth/SecurityGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'teacher' | 'student';
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  return <SecurityGuard {...props} />;
};

export default ProtectedRoute;
