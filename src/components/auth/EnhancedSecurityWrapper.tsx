
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface EnhancedSecurityWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const EnhancedSecurityWrapper: React.FC<EnhancedSecurityWrapperProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = []
}) => {
  const { student, teacher, isLoading } = useAuth();
  const [securityChecked, setSecurityChecked] = useState(false);

  useEffect(() => {
    const performSecurityCheck = () => {
      try {
        // Check authentication requirements
        if (requireAuth && !student && !teacher && !isLoading) {
          logUserSecurityEvent({
            type: 'unauthorized_access',
            timestamp: new Date().toISOString(),
            details: 'Unauthorized access attempt to protected resource',
            userAgent: navigator.userAgent
          });
          
          // Redirect to appropriate login page
          const currentPath = window.location.pathname;
          if (currentPath.includes('student')) {
            window.location.href = '/student-login';
          } else {
            window.location.href = '/teacher-login';
          }
          return;
        }

        // Check role-based access
        if (allowedRoles.length > 0) {
          const userRole = student ? 'student' : teacher?.role;
          if (userRole && !allowedRoles.includes(userRole)) {
            logUserSecurityEvent({
              type: 'unauthorized_access',
              userId: student?.id || teacher?.id,
              timestamp: new Date().toISOString(),
              details: `Role-based access denied. Required: ${allowedRoles.join(', ')}, User role: ${userRole}`,
              userAgent: navigator.userAgent
            });
            
            // Redirect to appropriate dashboard
            if (student) {
              window.location.href = '/student-dashboard';
            } else if (teacher) {
              window.location.href = '/teacher-dashboard';
            }
            return;
          }
        }

        setSecurityChecked(true);
      } catch (error) {
        logUserSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Security wrapper error: ${error}`,
          userAgent: navigator.userAgent
        });
      }
    };

    if (!isLoading) {
      performSecurityCheck();
    }
  }, [student, teacher, isLoading, requireAuth, allowedRoles]);

  // Show loading while security checks are in progress
  if (isLoading || !securityChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default EnhancedSecurityWrapper;
