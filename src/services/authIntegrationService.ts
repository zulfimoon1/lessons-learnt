
import { authenticateTeacher, authenticateStudent, registerTeacher, registerStudent } from './properAuthService';
import { secureStudentLogin, secureStudentSignup } from './secureStudentAuthService';

// Teacher authentication functions
export const loginTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 AuthIntegrationService: Teacher login attempt for:', email);
    const result = await authenticateTeacher(email, password);
    console.log('🔐 AuthIntegrationService: Teacher login result:', result);
    return result;
  } catch (error) {
    console.error('🔐 AuthIntegrationService: Teacher login error:', error);
    return { error: 'Authentication failed' };
  }
};

export const signupTeacher = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 AuthIntegrationService: Teacher signup attempt for:', { name, email, school, role });
    const result = await registerTeacher(name, email, school, password, role);
    console.log('📝 AuthIntegrationService: Teacher signup result:', result);
    return result;
  } catch (error) {
    console.error('📝 AuthIntegrationService: Teacher signup error:', error);
    return { error: 'Registration failed' };
  }
};

// Student authentication functions
export const loginStudent = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('🔐 AuthIntegrationService: Student login attempt for:', { fullName, school, grade });
    
    // Try the secure student login first
    const secureResult = await secureStudentLogin(fullName, school, grade, password);
    console.log('🔐 AuthIntegrationService: Secure student login result:', secureResult);
    return { student: secureResult.student };
    
  } catch (secureError) {
    console.log('🔐 AuthIntegrationService: Secure login failed, trying fallback:', secureError);
    
    try {
      // Fallback to the original auth service
      const fallbackResult = await authenticateStudent(fullName, school, grade, password);
      console.log('🔐 AuthIntegrationService: Fallback student login result:', fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('🔐 AuthIntegrationService: Both student login methods failed:', fallbackError);
      return { error: 'Invalid credentials' };
    }
  }
};

export const signupStudent = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 AuthIntegrationService: Student signup attempt for:', { fullName, school, grade });
    
    // Try the secure student signup first
    const secureResult = await secureStudentSignup(fullName, school, grade, password);
    console.log('📝 AuthIntegrationService: Secure student signup result:', secureResult);
    return { student: secureResult.student };
    
  } catch (secureError) {
    console.log('📝 AuthIntegrationService: Secure signup failed, trying fallback:', secureError);
    
    try {
      // Fallback to the original auth service
      const fallbackResult = await registerStudent(fullName, school, grade, password);
      console.log('📝 AuthIntegrationService: Fallback student signup result:', fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('📝 AuthIntegrationService: Both student signup methods failed:', fallbackError);
      return { error: 'Registration failed' };
    }
  }
};
