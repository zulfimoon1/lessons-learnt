
import { supabase } from '@/integrations/supabase/client';
import { secureStudentLogin, secureStudentSignup } from './secureStudentAuthService';
import { secureTeacherLogin, secureTeacherSignup } from './secureAuthService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

// Enhanced student authentication that works with our current RLS setup
export const enhancedSecureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Enhanced secure student login: Starting process');
    
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced student login attempt for: ${fullName}`,
      userAgent: navigator.userAgent
    });

    // Use the existing secure login service that handles all our security measures
    const result = await secureStudentLogin(fullName, school, grade, password);
    
    if (result.user) {
      console.log('Enhanced secure student login: Success');
      logUserSecurityEvent({
        type: 'login_success',
        userId: result.user.id,
        timestamp: new Date().toISOString(),
        details: `Enhanced student login successful for: ${fullName}`,
        userAgent: navigator.userAgent
      });
    } else if (result.error) {
      console.log('Enhanced secure student login: Failed -', result.error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced student login failed for: ${fullName} - ${result.error}`,
        userAgent: navigator.userAgent
      });
    }

    return result;
  } catch (error) {
    console.error('Enhanced secure student login: Error -', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced student login system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Login failed. Please try again.' };
  }
};

// Enhanced student signup that works with our current RLS setup
export const enhancedSecureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Enhanced secure student signup: Starting process');
    
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced student signup attempt for: ${fullName}`,
      userAgent: navigator.userAgent
    });

    // Use the existing secure signup service that handles all our security measures
    const result = await secureStudentSignup(fullName, school, grade, password);
    
    if (result.user) {
      console.log('Enhanced secure student signup: Success');
      logUserSecurityEvent({
        type: 'login_success',
        userId: result.user.id,
        timestamp: new Date().toISOString(),
        details: `Enhanced student signup successful for: ${fullName}`,
        userAgent: navigator.userAgent
      });
    } else if (result.error) {
      console.log('Enhanced secure student signup: Failed -', result.error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced student signup failed for: ${fullName} - ${result.error}`,
        userAgent: navigator.userAgent
      });
    }

    return result;
  } catch (error) {
    console.error('Enhanced secure student signup: Error -', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced student signup system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Signup failed. Please try again.' };
  }
};

// Enhanced teacher login with all security measures
export const enhancedSecureTeacherLogin = async (email: string, password: string) => {
  try {
    console.log('Enhanced secure teacher login: Starting process');
    
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced teacher login attempt for: ${email}`,
      userAgent: navigator.userAgent
    });

    const result = await secureTeacherLogin(email, password);
    
    if (result.user) {
      console.log('Enhanced secure teacher login: Success');
      logUserSecurityEvent({
        type: 'login_success',
        userId: result.user.id,
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher login successful for: ${email}`,
        userAgent: navigator.userAgent
      });
    } else if (result.error) {
      console.log('Enhanced secure teacher login: Failed -', result.error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher login failed for: ${email} - ${result.error}`,
        userAgent: navigator.userAgent
      });
    }

    return result;
  } catch (error) {
    console.error('Enhanced secure teacher login: Error -', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced teacher login system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Login failed. Please try again.' };
  }
};

// Enhanced teacher signup with all security measures
export const enhancedSecureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('Enhanced secure teacher signup: Starting process');
    
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced teacher signup attempt for: ${email}`,
      userAgent: navigator.userAgent
    });

    const result = await secureTeacherSignup(name, email, school, password, role);
    
    if (result.user) {
      console.log('Enhanced secure teacher signup: Success');
      logUserSecurityEvent({
        type: 'login_success',
        userId: result.user.id,
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher signup successful for: ${email}`,
        userAgent: navigator.userAgent
      });
    } else if (result.error) {
      console.log('Enhanced secure teacher signup: Failed -', result.error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Enhanced teacher signup failed for: ${email} - ${result.error}`,
        userAgent: navigator.userAgent
      });
    }

    return result;
  } catch (error) {
    console.error('Enhanced secure teacher signup: Error -', error);
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Enhanced teacher signup system error: ${error}`,
      userAgent: navigator.userAgent
    });
    return { error: 'Signup failed. Please try again.' };
  }
};
