
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';

interface SecureAuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Auth check error:', error);
          await enhancedSecurityService.logSecurityEvent({
            type: 'auth_check_error',
            details: `Authentication check failed: ${error.message}`,
            severity: 'medium'
          });
          
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
          return;
        }

        if (session?.user) {
          // Verify session security
          const isSessionValid = await enhancedSecurityService.checkSessionSecurity();
          
          if (!isSessionValid) {
            await supabase.auth.signOut();
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            });
            
            toast({
              title: "Session Expired",
              description: "Please log in again for security reasons.",
              variant: "destructive",
            });
            return;
          }

          setAuthState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Auth state check error:', error);
        
        if (isMounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event);
        
        await enhancedSecurityService.logSecurityEvent({
          type: 'auth_state_change',
          details: `Authentication state changed: ${event}`,
          severity: 'low',
          metadata: { event }
        });

        if (session?.user) {
          setAuthState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [toast]);

  const secureSignOut = async () => {
    try {
      await enhancedSecurityService.logSecurityEvent({
        type: 'user_logout',
        details: 'User initiated logout',
        severity: 'low'
      });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Clear any local security data
      sessionStorage.removeItem('csrf_token');
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Secure sign out error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    secureSignOut
  };
};
