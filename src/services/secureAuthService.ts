
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN:', email);
  
  try {
    // Query teachers table for matching email
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    if (queryError) {
      console.error('Database query error:', queryError);
      throw new Error('Authentication failed');
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ Teacher not found');
      throw new Error('Invalid credentials');
    }

    const teacher = teachers[0];
    console.log('✅ Teacher found:', teacher.id);

    // Verify password using bcrypt or simple hash comparison
    let passwordValid = false;
    try {
      // Try bcrypt first
      passwordValid = await bcrypt.compare(password, teacher.password_hash);
    } catch (bcryptError) {
      console.log('Bcrypt failed, trying simple hash comparison');
      // Fallback to simple hash for existing passwords
      const crypto = await import('crypto');
      const simpleHash = crypto.createHash('sha256').update(password + 'simple_salt_2024').digest('hex');
      passwordValid = simpleHash === teacher.password_hash;
    }

    if (!passwordValid) {
      console.log('❌ Invalid password');
      throw new Error('Invalid credentials');
    }

    console.log('✅ Teacher authentication successful');
    return { teacher };

  } catch (error) {
    console.error('Teacher login error:', error);
    throw error;
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP:', { name, email, school, role });
  
  try {
    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.trim().toLowerCase());

    if (checkError) {
      console.error('Database check error:', checkError);
      throw new Error('Registration failed');
    }

    if (existingTeachers && existingTeachers.length > 0) {
      throw new Error('Teacher already exists');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: hashedPassword,
        role: role
      })
      .select()
      .single();

    if (insertError) {
      console.error('Teacher creation error:', insertError);
      throw new Error('Registration failed');
    }

    console.log('✅ Teacher created successfully:', newTeacher.id);
    return { teacher: newTeacher };

  } catch (error) {
    console.error('Teacher signup error:', error);
    throw error;
  }
};

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('🔐 Teacher email login service called for:', email);
    
    const result = await secureTeacherLogin(email, password);
    
    if (result.teacher) {
      console.log('✅ Teacher login successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher login failed');
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Teacher login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 Teacher signup service called for:', name);
    
    const result = await secureTeacherSignup(name, email, school, password, role);
    
    if (result.teacher) {
      console.log('✅ Teacher signup successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher signup failed');
      return { error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Teacher signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('🔐 Student simple login service called for:', fullName);
    
    // For student login, we need to find the student first by full name
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim());

    if (queryError) {
      console.error('Student query error:', queryError);
      return { error: 'Login failed' };
    }

    if (!students || students.length === 0) {
      console.log('❌ Student not found');
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    console.log('✅ Student found, attempting login');

    // Use the secure student login service
    const { secureStudentLogin } = await import('./secureStudentAuthService');
    const result = await secureStudentLogin(student.full_name, student.school, student.grade, password);
    
    if (result.student) {
      console.log('✅ Student login successful');
      return { student: result.student };
    } else {
      console.log('❌ Student login failed');
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Student login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 Student signup service called for:', fullName);
    
    const { secureStudentSignup } = await import('./secureStudentAuthService');
    const result = await secureStudentSignup(fullName, school, grade, password);
    
    if (result.student) {
      console.log('✅ Student signup successful');
      return { student: result.student };
    } else {
      console.log('❌ Student signup failed');
      return { error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Student signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};
