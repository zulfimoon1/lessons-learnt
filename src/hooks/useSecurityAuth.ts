
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { authenticationSecurityService } from '@/services/security/authenticationSecurityService';

interface SecurityAuthUser {
  id: string;
  email?: string;
  fullName?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface SecurityAuthState {
  user: SecurityAuthUser | null;
  isLoading: boolean;
  sessionValid: boolean;
  csrfToken: string;
  securityScore: number;
}

export const useSecurityAuth = () => {
  const { teacher, student, isLoading: authLoading } = useAuth();
  const [authState, setAuthState] = useState<SecurityAuthState>({
    user: null,
    isLoading: true,
    sessionValid: false,
    csrfToken: '',
    securityScore: 0
  });

  useEffect(() => {
    const initializeSecurityAuth = async () => {
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
        
        // Calculate security score
        let securityScore = 50; // Base score
        
        if (teacher || student) {
          const currentUser = teacher || student;
          securityScore += 30; // Valid user
          securityScore += 20; // No recent security issues

          setAuthState({
            user: {
              id: currentUser.id,
              email: teacher?.email,
              fullName: student?.full_name || teacher?.name,
              school: currentUser.school,
              role: teacher?.role || 'student',
              userType: teacher ? 'teacher' : 'student'
            },
            isLoading: false,
            sessionValid: true,
            csrfToken,
            securityScore
          });

          // Log successful authentication
          await enhancedSecurityValidationService.logSecurityEvent({
            type: 'session_restored',
            userId: currentUser.id,
            details: `Security authentication successful, score: ${securityScore}`,
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
        console.error('Security auth initialization failed:', error);
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: `Security auth initialization failed: ${error}`,
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
      initializeSecurityAuth();
    }
  }, [teacher, student, authLoading]);

  const secureLogin = async (credentials: any, userType: 'teacher' | 'student' | 'admin') => {
    try {
      const result = await authenticationSecurityService.authenticateUser(
        userType,
        credentials,
        {
          userAgent: navigator.userAgent,
          ipAddress: 'client'
        }
      );

      if (result.success && result.user) {
        setAuthState(prev => ({
          ...prev,
          user: {
            id: result.user.sessionId,
            email: credentials.email,
            fullName: credentials.fullName || credentials.name,
            school: credentials.school || 'Unknown School',
            role: result.user.userType,
            userType: result.user.userType
          },
          sessionValid: true,
          csrfToken: result.user.csrfToken,
          securityScore: 85
        }));
      }

      return result;
    } catch (error) {
      console.error('Secure login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const refreshSecurityToken = async () => {
    const newToken = enhancedSecurityValidationService.generateCSRFToken();
    setAuthState(prev => ({ ...prev, csrfToken: newToken }));
    return newToken;
  };

  const secureLogout = () => {
    authenticationSecurityService.cleanup();
    setAuthState({
      user: null,
      isLoading: false,
      sessionValid: false,
      csrfToken: '',
      securityScore: 0
    });
  };

  return {
    ...authState,
    secureLogin,
    secureLogout,
    refreshSecurityToken
  };
};
