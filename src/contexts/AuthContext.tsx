
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';
import { secureSessionService } from '@/services/secureSessionService';
import { enhancedValidateInput } from '@/services/enhancedInputValidation';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/services/securePasswordService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
}

interface AuthContextType {
  student: Student | null;
  teacher: Teacher | null;
  isLoading: boolean;
  studentLogin: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string }>;
  teacherLogin: (email: string, password: string) => Promise<{ error?: string }>;
  studentSignup: (fullName: string, school: string, grade: string, password: string) => Promise<{ error?: string }>;
  teacherSignup: (name: string, email: string, school: string, password: string, role?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Starting secure initialization...');
    
    const initializeAuth = async () => {
      try {
        // Initialize security monitoring
        securityService.monitorSecurityViolations();
        
        // Check for existing secure session
        const session = secureSessionService.securelyRetrieveUserData('user');
        if (session) {
          if (session.userType === 'student') {
            setStudent(session);
          } else if (session.userType === 'teacher') {
            setTeacher(session);
          }
        }

        // Validate session if exists
        const isValidSession = await securityService.validateSession();
        if (!isValidSession && session) {
          await logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Secure initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const studentLogin = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(fullName);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      const gradeValidation = enhancedValidateInput.validateGrade(grade);
      if (!gradeValidation.isValid) {
        return { error: gradeValidation.message };
      }

      // Rate limiting check
      const rateLimitCheck = await securityService.checkRateLimit(
        `${fullName}_${school}`,
        'student_login',
        { maxAttempts: 5, windowMinutes: 15 }
      );

      if (!rateLimitCheck.allowed) {
        logUserSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: 'Student login rate limit exceeded',
          userAgent: navigator.userAgent
        });
        return { error: rateLimitCheck.message };
      }

      // Sanitize inputs
      const sanitizedName = enhancedValidateInput.sanitizeText(fullName);
      const sanitizedSchool = enhancedValidateInput.sanitizeText(school);
      const sanitizedGrade = enhancedValidateInput.sanitizeText(grade);

      // Query database for student
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', sanitizedName)
        .eq('school', sanitizedSchool)
        .eq('grade', sanitizedGrade);

      if (error || !students || students.length === 0) {
        await securityService.recordAttempt(`${fullName}_${school}`, 'student_login', false);
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: 'Invalid student credentials',
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      const studentData = students[0];

      // Verify password
      const isValidPassword = await verifyPassword(password, studentData.password_hash);
      if (!isValidPassword) {
        await securityService.recordAttempt(`${fullName}_${school}`, 'student_login', false);
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: 'Invalid password for student',
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      // Create secure session
      const sessionData = {
        id: studentData.id,
        full_name: studentData.full_name,
        school: studentData.school,
        grade: studentData.grade,
        userType: 'student' as const
      };

      secureSessionService.securelyStoreUserData('user', sessionData);
      setStudent(sessionData);

      await securityService.recordAttempt(`${fullName}_${school}`, 'student_login', true);
      
      logUserSecurityEvent({
        type: 'login_success',
        userId: studentData.id,
        timestamp: new Date().toISOString(),
        details: 'Student login successful',
        userAgent: navigator.userAgent
      });

      return {};
    } catch (error) {
      console.error('Student login error:', error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Student login error: ${error}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Login failed. Please try again.' };
    }
  };

  const teacherLogin = async (email: string, password: string) => {
    try {
      // Enhanced input validation
      const emailValidation = enhancedValidateInput.validateEmail(email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.message };
      }

      // Rate limiting check
      const rateLimitCheck = await securityService.checkRateLimit(
        email,
        'teacher_login',
        { maxAttempts: 5, windowMinutes: 15 }
      );

      if (!rateLimitCheck.allowed) {
        logUserSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: 'Teacher login rate limit exceeded',
          userAgent: navigator.userAgent
        });
        return { error: rateLimitCheck.message };
      }

      // Sanitize email
      const sanitizedEmail = enhancedValidateInput.sanitizeText(email.toLowerCase());

      // Query database for teacher
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', sanitizedEmail);

      if (error || !teachers || teachers.length === 0) {
        await securityService.recordAttempt(email, 'teacher_login', false);
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: 'Invalid teacher credentials',
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      const teacherData = teachers[0];

      // Verify password
      const isValidPassword = await verifyPassword(password, teacherData.password_hash);
      if (!isValidPassword) {
        await securityService.recordAttempt(email, 'teacher_login', false);
        logUserSecurityEvent({
          type: 'login_failed',
          timestamp: new Date().toISOString(),
          details: 'Invalid password for teacher',
          userAgent: navigator.userAgent
        });
        return { error: 'Invalid credentials' };
      }

      // Create secure session
      const sessionData = {
        id: teacherData.id,
        name: teacherData.name,
        email: teacherData.email,
        school: teacherData.school,
        role: teacherData.role,
        userType: 'teacher' as const
      };

      secureSessionService.securelyStoreUserData('user', sessionData);
      setTeacher(sessionData);

      await securityService.recordAttempt(email, 'teacher_login', true);
      
      logUserSecurityEvent({
        type: 'login_success',
        userId: teacherData.id,
        timestamp: new Date().toISOString(),
        details: 'Teacher login successful',
        userAgent: navigator.userAgent
      });

      return {};
    } catch (error) {
      console.error('Teacher login error:', error);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Teacher login error: ${error}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Login failed. Please try again.' };
    }
  };

  const studentSignup = async (fullName: string, school: string, grade: string, password: string) => {
    try {
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(fullName);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      const gradeValidation = enhancedValidateInput.validateGrade(grade);
      if (!gradeValidation.isValid) {
        return { error: gradeValidation.message };
      }

      // Enhanced password validation
      const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.message };
      }

      // Sanitize inputs
      const sanitizedName = enhancedValidateInput.sanitizeText(fullName);
      const sanitizedSchool = enhancedValidateInput.sanitizeText(school);
      const sanitizedGrade = enhancedValidateInput.sanitizeText(grade);

      // Check if student already exists
      const { data: existingStudents } = await supabase
        .from('students')
        .select('id')
        .eq('full_name', sanitizedName)
        .eq('school', sanitizedSchool)
        .eq('grade', sanitizedGrade);

      if (existingStudents && existingStudents.length > 0) {
        return { error: 'Student already exists with these details' };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create student
      const { data, error } = await supabase
        .from('students')
        .insert({
          full_name: sanitizedName,
          school: sanitizedSchool,
          grade: sanitizedGrade,
          password_hash: passwordHash
        })
        .select()
        .single();

      if (error || !data) {
        logUserSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Student signup failed: ${error?.message}`,
          userAgent: navigator.userAgent
        });
        return { error: 'Signup failed. Please try again.' };
      }

      // Create secure session
      const sessionData = {
        id: data.id,
        full_name: data.full_name,
        school: data.school,
        grade: data.grade,
        userType: 'student' as const
      };

      secureSessionService.securelyStoreUserData('user', sessionData);
      setStudent(sessionData);

      logUserSecurityEvent({
        type: 'login_success',
        userId: data.id,
        timestamp: new Date().toISOString(),
        details: 'Student signup and login successful',
        userAgent: navigator.userAgent
      });

      return {};
    } catch (error) {
      console.error('Student signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const teacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
    try {
      // Enhanced input validation
      const nameValidation = enhancedValidateInput.validateName(name);
      if (!nameValidation.isValid) {
        return { error: nameValidation.message };
      }

      const emailValidation = enhancedValidateInput.validateEmail(email);
      if (!emailValidation.isValid) {
        return { error: emailValidation.message };
      }

      const schoolValidation = enhancedValidateInput.validateSchool(school);
      if (!schoolValidation.isValid) {
        return { error: schoolValidation.message };
      }

      // Enhanced password validation
      const passwordValidation = enhancedValidateInput.validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.message };
      }

      // Sanitize inputs
      const sanitizedName = enhancedValidateInput.sanitizeText(name);
      const sanitizedEmail = enhancedValidateInput.sanitizeText(email.toLowerCase());
      const sanitizedSchool = enhancedValidateInput.sanitizeText(school);

      // Check if teacher already exists
      const { data: existingTeachers } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', sanitizedEmail);

      if (existingTeachers && existingTeachers.length > 0) {
        return { error: 'Teacher already exists with this email' };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create teacher
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          name: sanitizedName,
          email: sanitizedEmail,
          school: sanitizedSchool,
          password_hash: passwordHash,
          role: role
        })
        .select()
        .single();

      if (error || !data) {
        logUserSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Teacher signup failed: ${error?.message}`,
          userAgent: navigator.userAgent
        });
        return { error: 'Signup failed. Please try again.' };
      }

      // Create secure session
      const sessionData = {
        id: data.id,
        name: data.name,
        email: data.email,
        school: data.school,
        role: data.role,
        userType: 'teacher' as const
      };

      secureSessionService.securelyStoreUserData('user', sessionData);
      setTeacher(sessionData);

      logUserSecurityEvent({
        type: 'login_success',
        userId: data.id,
        timestamp: new Date().toISOString(),
        details: 'Teacher signup and login successful',
        userAgent: navigator.userAgent
      });

      return {};
    } catch (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const currentUser = student || teacher;
      if (currentUser) {
        logUserSecurityEvent({
          type: 'logout',
          userId: currentUser.id,
          timestamp: new Date().toISOString(),
          details: 'User logout',
          userAgent: navigator.userAgent
        });
      }

      // Clear secure sessions
      secureSessionService.clearAllSessions();
      await securityService.clearSession();

      setStudent(null);
      setTeacher(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    student,
    teacher,
    isLoading,
    studentLogin,
    teacherLogin,
    studentSignup,
    teacherSignup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
