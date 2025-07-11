
import { secureAuthenticationService } from './secureAuthenticationService';
import { secureStudentLogin, secureStudentSignup } from './secureStudentAuthService';

// Teacher authentication functions - now using secure service
export const loginTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 AuthIntegrationService: Secure teacher login attempt for:', email);
    const result = await secureAuthenticationService.authenticateTeacher(email, password);
    console.log('🔐 AuthIntegrationService: Secure teacher login result:', result.teacher ? 'Success' : 'Failed');
    return result;
  } catch (error) {
    console.error('🔐 AuthIntegrationService: Teacher login error:', error);
    return { error: 'Authentication failed' };
  }
};

export const signupTeacher = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 AuthIntegrationService: Secure teacher signup attempt for:', { name, email, school, role });
    const result = await secureAuthenticationService.registerTeacher(name, email, school, password, role);
    console.log('📝 AuthIntegrationService: Secure teacher signup result:', result.teacher ? 'Success' : 'Failed');
    return result;
  } catch (error) {
    console.error('📝 AuthIntegrationService: Teacher signup error:', error);
    return { error: 'Registration failed' };
  }
};

// Student authentication functions - now using secure service
export const loginStudent = async (fullName: string, password: string) => {
  try {
    console.log('🔐 AuthIntegrationService: Secure student login attempt for:', { fullName });
    
    const result = await secureStudentLogin(fullName, password);
    console.log('🔐 AuthIntegrationService: Secure student login result:', result.student ? 'Success' : 'Failed');
    return { student: result.student };
    
  } catch (error) {
    console.error('🔐 AuthIntegrationService: Secure student login failed:', error);
    return { error: error instanceof Error ? error.message : 'Invalid credentials' };
  }
};

export const signupStudent = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 AuthIntegrationService: Secure student signup attempt for:', { fullName, school, grade });
    
    const result = await secureStudentSignup(fullName, school, grade, password);
    console.log('📝 AuthIntegrationService: Secure student signup result:', result.student ? 'Success' : 'Failed');
    return { student: result.student };
    
  } catch (error) {
    console.error('📝 AuthIntegrationService: Secure student signup failed:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};
