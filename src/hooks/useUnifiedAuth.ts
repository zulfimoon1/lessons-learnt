
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '@/services/unifiedAuthService';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';

interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface UnifiedAuthState {
  user: AuthUser | null;
  isLoading: boolean;
  sessionValid: boolean;
  csrfToken: string;
}

export const useUnifiedAuth = () => {
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    user: null,
    isLoading: true,
    sessionValid: false,
    csrfToken: ''
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Validate session security
        const isSessionSecure = enhancedSecurityValidationService.validateSessionSecurity();
        
        if (!isSessionSecure) {
          setAuthState({
            user: null,
            isLoading: false,
            sessionValid: false,
            csrfToken: enhancedSecurityValidationService.generateCSRFToken()
          });
          return;
        }

        // Get current user from secure session
        const currentUser = await unifiedAuthService.getCurrentUser();
        
        if (currentUser) {
          const session = unifiedAuthService.getSecureSession();
          setAuthState({
            user: currentUser,
            isLoading: false,
            sessionValid: true,
            csrfToken: session?.csrfToken || enhancedSecurityValidationService.generateCSRFToken()
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            sessionValid: false,
            csrfToken: enhancedSecurityValidationService.generateCSRFToken()
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          sessionValid: false,
          csrfToken: enhancedSecurityValidationService.generateCSRFToken()
        });
      }
    };

    initializeAuth();

    // Set up session monitoring
    const sessionInterval = setInterval(async () => {
      if (authState.sessionValid) {
        const refreshed = await unifiedAuthService.refreshSession();
        if (!refreshed) {
          setAuthState(prev => ({
            ...prev,
            user: null,
            sessionValid: false
          }));
        }
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(sessionInterval);
  }, []);

  const login = async (credentials: {
    email?: string;
    fullName?: string;
    school: string;
    grade?: string;
    password: string;
    role?: 'teacher' | 'admin' | 'doctor';
    userType: 'teacher' | 'student';
  }) => {
    const result = await unifiedAuthService.secureLogin(credentials);
    
    if (result.success && result.user) {
      const session = unifiedAuthService.getSecureSession();
      setAuthState({
        user: result.user,
        isLoading: false,
        sessionValid: true,
        csrfToken: session?.csrfToken || enhancedSecurityValidationService.generateCSRFToken()
      });
    }
    
    return result;
  };

  const signup = async (data: {
    userType: 'teacher' | 'student';
    name?: string;
    fullName?: string;
    email?: string;
    school: string;
    grade?: string;
    role?: string;
    password: string;
  }) => {
    const result = await unifiedAuthService.secureSignup(data);
    
    if (result.success && result.user) {
      const session = unifiedAuthService.getSecureSession();
      setAuthState({
        user: result.user,
        isLoading: false,
        sessionValid: true,
        csrfToken: session?.csrfToken || enhancedSecurityValidationService.generateCSRFToken()
      });
    }
    
    return result;
  };

  const logout = () => {
    unifiedAuthService.clearSecureSession();
    setAuthState({
      user: null,
      isLoading: false,
      sessionValid: false,
      csrfToken: enhancedSecurityValidationService.generateCSRFToken()
    });
  };

  const refreshToken = async () => {
    const newToken = enhancedSecurityValidationService.generateCSRFToken();
    setAuthState(prev => ({ ...prev, csrfToken: newToken }));
    return newToken;
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    refreshToken
  };
};
