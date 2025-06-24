
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { Navigate } from 'react-router-dom';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('teacher' | 'student' | 'admin')[];
  allowedRoles?: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedUserTypes = [],
  allowedRoles = [],
  redirectTo = '/'
}) => {
  const { teacher, student } = useAuth();
  const { admin } = usePlatformAdmin();

  // Platform admin has access to everything
  if (admin) {
    return <>{children}</>;
  }

  // Check user type access
  if (allowedUserTypes.length > 0) {
    const hasUserTypeAccess = 
      (allowedUserTypes.includes('teacher') && teacher) ||
      (allowedUserTypes.includes('student') && student) ||
      (allowedUserTypes.includes('admin') && admin);

    if (!hasUserTypeAccess) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check role-based access for teachers
  if (allowedRoles.length > 0 && teacher) {
    if (!allowedRoles.includes(teacher.role)) {
      return <Navigate to="/teacher-dashboard" replace />;
    }
  }

  // Check if any user is authenticated
  if (!teacher && !student && !admin) {
    return <Navigate to="/teacher-login" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
