
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword, hashPassword } from './securePasswordService';
import { initializeDemoPasswords, isDemoAccount } from './demoAccountManager';

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('Teacher login attempt:', email);

    // Check if this is a demo account and initialize if needed
    if (isDemoAccount(email)) {
      console.log('Demo account detected, initializing password...');
      const initResult = await initializeDemoPasswords();
      if (!initResult.success) {
        console.error('Failed to initialize demo passwords:', initResult.error);
      } else {
        console.log('Demo passwords initialized successfully');
      }
    }

    // Get teacher from database
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !teacher) {
      console.log('Teacher not found:', error);
      return { error: 'Invalid email or password' };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, teacher.password_hash);
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return { error: 'Invalid email or password' };
    }

    console.log('Teacher login successful');
    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
        specialization: teacher.specialization,
        license_number: teacher.license_number,
        is_available: teacher.is_available
      }
    };
  } catch (error) {
    console.error('Teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('Student login attempt:', fullName);

    // Check if this is a demo account and initialize if needed
    if (isDemoAccount(undefined, fullName)) {
      console.log('Demo student account detected, initializing password...');
      const initResult = await initializeDemoPasswords();
      if (!initResult.success) {
        console.error('Failed to initialize demo passwords:', initResult.error);
      } else {
        console.log('Demo passwords initialized successfully');
      }
    }

    // Get student from database
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .single();

    if (error || !student) {
      console.log('Student not found:', error);
      return { error: 'Invalid credentials' };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return { error: 'Invalid credentials' };
    }

    console.log('Student login successful');
    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
      }
    };
  } catch (error) {
    console.error('Student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('Teacher signup attempt:', { name, email, school, role });

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingTeacher) {
      return { error: 'A teacher with this email already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        password_hash: hashedPassword,
        role: role
      }])
      .select()
      .single();

    if (error) {
      console.error('Teacher signup error:', error);
      return { error: 'Failed to create teacher account' };
    }

    console.log('Teacher signup successful');
    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
        specialization: teacher.specialization,
        license_number: teacher.license_number,
        is_available: teacher.is_available
      }
    };
  } catch (error) {
    console.error('Teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('Student signup attempt:', { fullName, school, grade });

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (existingStudent) {
      return { error: 'A student with these details already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create student
    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Student signup error:', error);
      return { error: 'Failed to create student account' };
    }

    console.log('Student signup successful');
    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
      }
    };
  } catch (error) {
    console.error('Student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
