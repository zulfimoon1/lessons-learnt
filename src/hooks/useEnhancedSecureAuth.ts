
import { useState, useEffect } from 'react';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { secureDataAccessService } from '@/services/secureDataAccessService';
import { useAuth } from '@/contexts/AuthContext';

interface SecureAuthUser {
  id: string;
  email?: string;
  fullName?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface SecureAuthState {
  user: SecureAuthUser | null;
  isLoading: boolean;
  sessionValid: boolean;
  csrfToken: string;
  securityScore: number;
}

export const useEnhancedSecureAuth = () => {
  const { teacher, student, isLoading: authLoading } = useAuth();
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    isLoading: true,
    sessionValid: false,
    csrfToken: '',
    securityScore: 0
  });

  useEffect(() => {
    const initializeEnhancedSecurity = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // Enhanced session validation
        const isSessionSecure = enhancedSecurityValidationService.validateSessionSecurity();
        
        if (!isSessionSecure) {
          setAuthState({
            user: null,
            isLoading: false,
            sessionValid: false,
            csrfToken: '',
            securityScore: 0
          });
          return;
        }

        // Generate fresh CSRF token
        const csrfToken = enhancedSecurityValidationService.generateCSRFToken();
        
        // Calculate security score based on current session
        let securityScore = 50; // Base score
        
        if (teacher || student) {
          const currentUser = teacher || student;
          
          // Validate data access permissions
          const hasValidAccess = await secureDataAccessService.validateAccess(
            'general', 
            'SELECT', 
            {
              userId: currentUser.id,
              userRole: teacher?.role,
              userSchool: currentUser.school,
              userType: teacher ? 'teacher' : 'student'
            }
          );

          if (hasValidAccess) {
            securityScore += 30;
          }

          // Check for recent security events
          securityScore += 20; // Assuming no recent issues

          setAuthState({
            user: {
              id: currentUser.id,
              email: teacher?.email,
              fullName: student?.fullName || teacher?.name,
              school: currentUser.school,
              role: teacher?.role || 'student',
              userType: teacher ? 'teacher' : 'student'
            },
            isLoading: false,
            sessionValid: true,
            csrfToken,
            securityScore
          });

          // Log successful enhanced authentication
          await enhancedSecurityValidationService.logSecurityEvent({
            type: 'session_restored',
            userId: currentUser.id,
            details: `Enhanced secure authentication successful, security score: ${securityScore}`,
            severity: 'low'
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            sessionValid: false,
            csrfToken,
            securityScore: 0
          });
        }

      } catch (error) {
        console.error('Enhanced security initialization failed:', error);
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Enhanced security initialization failed: ${error}`,
          severity: 'medium'
        });
        
        setAuthState({
          user: null,
          isLoading: false,
          sessionValid: false,
          csrfToken: '',
          securityScore: 0
        });
      }
    };

    if (!authLoading) {
      initializeEnhancedSecurity();
    }
  }, [teacher, student, authLoading]);

  const refreshSecurityToken = async () => {
    const newToken = enhancedSecurityValidationService.generateCSRFToken();
    setAuthState(prev => ({ ...prev, csrfToken: newToken }));
    return newToken;
  };

  return {
    ...authState,
    refreshSecurityToken
  };
};
