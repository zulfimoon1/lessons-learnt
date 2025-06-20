
import { authenticateTeacher, authenticateStudent, registerTeacher, registerStudent } from './properAuthService';
import { Teacher, Student } from '@/types/auth';

export const loginTeacher = async (email: string, password: string): Promise<{ teacher?: Teacher; error?: string }> => {
  try {
    const result = await authenticateTeacher(email, password);
    return result;
  } catch (error) {
    console.error('Teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const loginStudent = async (fullName: string, school: string, grade: string, password: string): Promise<{ student?: Student; error?: string }> => {
  try {
    const result = await authenticateStudent(fullName, school, grade, password);
    return result;
  } catch (error) {
    console.error('Student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const signupTeacher = async (name: string, email: string, school: string, password: string, role: string = 'teacher'): Promise<{ teacher?: Teacher; error?: string }> => {
  try {
    const result = await registerTeacher(name, email, school, password, role);
    return result;
  } catch (error) {
    console.error('Teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const signupStudent = async (fullName: string, school: string, grade: string, password: string): Promise<{ student?: Student; error?: string }> => {
  try {
    const result = await registerStudent(fullName, school, grade, password);
    return result;
  } catch (error) {
    console.error('Student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
