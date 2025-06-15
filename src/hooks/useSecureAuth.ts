
import { useState, useEffect } from 'react';
import { enhancedSecureSessionService } from '@/services/enhancedSecureSessionService';
import { securityValidationService } from '@/services/securityValidationService';

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
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    isLoading: true,
    sessionValid: false,
    csrfToken: ''
  });

  useEffect(() => {
    const initializeSecureAuth = async () => {
      try {
        // Check for existing secure session
        const session = await enhancedSecureSessionService.getSession();
        
        if (session) {
          // Validate session security
          const isSessionSecure = securityValidationService.validateSessionSecurity();
          
          if (isSessionSecure) {
            const refreshedSession = await enhancedSecureSessionService.refreshSession(session);
            
            if (refreshedSession) {
              setAuthState({
                user: {
                  id: refreshedSession.userId,
                  email: refreshedSession.userType === 'teacher' ? 'user@school.com' : undefined,
                  fullName: refreshedSession.userType === 'student' ? 'Student Name' : 'User Name',
                  school: refreshedSession.school,
                  role: refreshedSession.userType,
                  userType: refreshedSession.userType
                },
                isLoading: false,
                sessionValid: true,
                csrfToken: refreshedSession.csrfToken
              });
              return;
            }
          }
        }

        // No valid session found
        setAuthState({
          user: null,
          isLoading: false,
          sessionValid: false,
          csrfToken: enhancedSecureSessionService.getCSRFToken()
        });

      } catch (error) {
        console.error('Secure auth initialization failed:', error);
        setAuthState({
          user: null,
          isLoading: false,
          sessionValid: false,
          csrfToken: ''
        });
      }
    };

    initializeSecureAuth();

    // Set up session monitoring
    const sessionMonitorInterval = setInterval(async () => {
      if (authState.sessionValid) {
        await enhancedSecureSessionService.detectSuspiciousActivity();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(sessionMonitorInterval);
  }, []);

  const secureLogin = async (credentials: any, userType: 'teacher' | 'student' | 'admin') => {
    try {
      // Rate limiting check
      const rateLimitKey = `${userType}_login_${credentials.email || credentials.fullName}`;
      if (!securityValidationService.checkRateLimit(rateLimitKey)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Create secure session
      const session = await enhancedSecureSessionService.createSession(
        credentials.id || crypto.randomUUID(),
        userType,
        credentials.school || 'Unknown School'
      );

      setAuthState({
        user: {
          id: session.userId,
          email: credentials.email,
          fullName: credentials.fullName || credentials.name,
          school: session.school,
          role: session.userType,
          userType: session.userType
        },
        isLoading: false,
        sessionValid: true,
        csrfToken: session.csrfToken
      });

      return { success: true };
    } catch (error) {
      console.error('Secure login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const secureLogout = () => {
    enhancedSecureSessionService.clearSession();
    setAuthState({
      user: null,
      isLoading: false,
      sessionValid: false,
      csrfToken: ''
    });
  };

  return {
    ...authState,
    secureLogin,
    secureLogout
  };
};
