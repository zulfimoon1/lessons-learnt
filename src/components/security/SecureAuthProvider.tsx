
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureAuthenticationService } from '@/services/secureAuthenticationService';
import { useToast } from '@/hooks/use-toast';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, additionalData?: Record<string, any>) => Promise<{ error?: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

interface SecureAuthProviderProps {
  children: ReactNode;
}

export const SecureAuthProvider: React.FC<SecureAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;

            console.log('Auth state change:', event);
            
            if (session?.user) {
              const isSessionValid = await secureAuthenticationService.validateSessionSecurity();
              
              if (isSessionValid) {
                setSession(session);
                setUser(session.user);
              } else {
                await secureAuthenticationService.secureSignOut();
                setSession(null);
                setUser(null);
                toast({
                  title: "Session Invalid",
                  description: "Your session has been terminated for security reasons.",
                  variant: "destructive",
                });
              }
            } else {
              setSession(null);
              setUser(null);
            }
            
            setIsLoading(false);
          }
        );

        // Then check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user && isMounted) {
          const isSessionValid = await secureAuthenticationService.validateSessionSecurity();
          
          if (isSessionValid) {
            setSession(session);
            setUser(session.user);
          } else {
            await secureAuthenticationService.secureSignOut();
          }
        }
        
        setIsLoading(false);

        // Start session monitoring
        secureAuthenticationService.startSessionMonitoring();

        return () => {
          isMounted = false;
          subscription?.unsubscribe();
        };

      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const result = await secureAuthenticationService.secureLogin(email, password);
    
    if (result.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      });
      return { error: result.error };
    }

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    return {};
  };

  const signup = async (
    email: string, 
    password: string, 
    additionalData?: Record<string, any>
  ): Promise<{ error?: string; requiresVerification?: boolean }> => {
    const result = await secureAuthenticationService.secureSignup(email, password, additionalData);
    
    if (result.error) {
      toast({
        title: "Signup Failed",
        description: result.error,
        variant: "destructive",
      });
      return { error: result.error };
    }

    if (result.requiresVerification) {
      toast({
        title: "Check Your Email",
        description: "Please verify your email address to complete registration.",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
    }

    return { requiresVerification: result.requiresVerification };
  };

  const logout = async (): Promise<void> => {
    try {
      await secureAuthenticationService.secureSignOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        const isValid = await secureAuthenticationService.validateSessionSecurity();
        if (!isValid) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
    }
  };

  return (
    <SecureAuthContext.Provider value={{
      user,
      session,
      isLoading,
      login,
      signup,
      logout,
      refreshSession
    }}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
