
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { godModeTeacherLogin, godModeStudentLogin, isDemoTeacher, isDemoStudent } from './demoAccountManager';

// Teacher login with email and password
export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('=== TEACHER LOGIN ATTEMPT ===');
    console.log('Email:', email);

    // 🎯 DEMO ACCOUNTS GET INSTANT GOD MODE ACCESS
    if (isDemoTeacher(email)) {
      console.log('🎯 DEMO TEACHER LOGIN - USING GOD MODE');
      const result = await godModeTeacherLogin(email, password);
      if (result) {
        console.log('✅ DEMO LOGIN SUCCESSFUL, TEACHER DATA:', result);
        return { teacher: result };
      }
      console.log('❌ DEMO LOGIN FAILED');
      return { error: 'Invalid demo credentials' };
    }

    // Regular teacher login flow
    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (searchError) {
      console.error('Teacher search error:', searchError);
      return { error: 'Database error during login' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
    if (!isValidPassword) {
      console.log('Invalid password for teacher:', email);
      return { error: 'Invalid email or password' };
    }

    console.log('Teacher login successful:', teacher.name);
    return { teacher };
  } catch (error) {
    console.error('Teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

// Student login with full name and password
export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('=== STUDENT LOGIN ATTEMPT ===');
    console.log('Full name:', fullName);

    // 🎯 DEMO STUDENTS GET INSTANT GOD MODE ACCESS
    if (isDemoStudent(fullName)) {
      console.log('🎯 DEMO STUDENT LOGIN - USING GOD MODE');
      const result = await godModeStudentLogin(fullName, password);
      if (result) {
        console.log('✅ DEMO STUDENT LOGIN SUCCESSFUL:', result);
        return { student: result };
      }
      console.log('❌ DEMO STUDENT LOGIN FAILED');
      return { error: 'Invalid demo credentials' };
    }

    // Regular student login flow
    const { data: students, error: searchError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim());

    if (searchError) {
      console.error('Student search error:', searchError);
      return { error: 'Database error during login' };
    }

    if (!students || students.length === 0) {
      console.log('No student found with name:', fullName);
      return { error: 'Invalid name or password' };
    }

    const student = students[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password_hash);
    if (!isValidPassword) {
      console.log('Invalid password for student:', fullName);
      return { error: 'Invalid name or password' };
    }

    console.log('Student login successful:', student.full_name);
    return { student };
  } catch (error) {
    console.error('Student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

// Teacher signup
export const teacherSignupService = async (
  name: string, 
  email: string, 
  school: string, 
  password: string, 
  role: 'teacher' | 'admin' | 'doctor' = 'teacher'
) => {
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
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Teacher creation error:', error);
      return { error: 'Failed to create teacher account' };
    }

    console.log('Teacher signup successful:', teacher.name);
    return { teacher };
  } catch (error) {
    console.error('Teacher signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};

// Student signup
export const studentSignupService = async (
  fullName: string,
  school: string,
  grade: string,
  password: string
) => {
  try {
    console.log('Student signup attempt:', { fullName, school, grade });

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .single();

    if (existingStudent) {
      return { error: 'A student with this name already exists in this school' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

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
      console.error('Student creation error:', error);
      return { error: 'Failed to create student account' };
    }

    console.log('Student signup successful:', student.full_name);
    return { student };
  } catch (error) {
    console.error('Student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
