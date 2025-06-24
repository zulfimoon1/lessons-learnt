
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  specialization?: string;
  is_available?: boolean;
}

export interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

export interface AuthResult {
  teacher?: Teacher;
  student?: Student;
  error?: string;
}

export const loginTeacher = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('🔐 Teacher login attempt for:', email);

    // Set platform admin context if needed
    if (email === 'zulfimoon1@gmail.com') {
      await supabase.rpc('set_platform_admin_context', { admin_email: email });
    }

    // Query teacher by email
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (teacherError) {
      console.error('❌ Teacher query error:', teacherError);
      
      if (teacherError.code === 'PGRST116') {
        return { error: 'Teacher not found with this email address' };
      }
      
      return { error: `Database error: ${teacherError.message}` };
    }

    if (!teacherData) {
      console.log('❌ No teacher found for email:', email);
      return { error: 'Teacher not found with this email address' };
    }

    console.log('✅ Teacher found:', teacherData.name);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, teacherData.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for teacher:', email);
      return { error: 'Invalid password' };
    }

    console.log('✅ Teacher login successful:', teacherData.name);

    const teacher: Teacher = {
      id: teacherData.id,
      name: teacherData.name,
      email: teacherData.email,
      school: teacherData.school,
      role: teacherData.role,
      specialization: teacherData.specialization,
      is_available: teacherData.is_available
    };

    return { teacher };

  } catch (error) {
    console.error('💥 Teacher login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const signupTeacher = async (
  name: string, 
  email: string, 
  school: string, 
  password: string, 
  role: string = 'teacher'
): Promise<AuthResult> => {
  try {
    console.log('🔐 Teacher signup attempt for:', email);

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingTeacher) {
      return { error: 'A teacher with this email already exists' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create teacher
    const { data: newTeacher, error: createError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        password_hash: hashedPassword,
        role: role
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Teacher creation error:', createError);
      return { error: `Failed to create account: ${createError.message}` };
    }

    console.log('✅ Teacher created successfully:', newTeacher.name);

    const teacher: Teacher = {
      id: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      school: newTeacher.school,
      role: newTeacher.role,
      specialization: newTeacher.specialization,
      is_available: newTeacher.is_available
    };

    return { teacher };

  } catch (error) {
    console.error('💥 Teacher signup error:', error);
    return { error: 'Account creation failed. Please try again.' };
  }
};

export const loginStudent = async (
  fullName: string, 
  school: string, 
  grade: string, 
  password: string
): Promise<AuthResult> => {
  try {
    console.log('🔐 Student login attempt for:', fullName, 'at', school);

    // Query student
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (studentError) {
      console.error('❌ Student query error:', studentError);
      
      if (studentError.code === 'PGRST116') {
        return { error: 'Student not found with these details' };
      }
      
      return { error: `Database error: ${studentError.message}` };
    }

    if (!studentData) {
      return { error: 'Student not found with these details' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, studentData.password_hash);
    
    if (!isPasswordValid) {
      return { error: 'Invalid password' };
    }

    console.log('✅ Student login successful:', studentData.full_name);

    const student: Student = {
      id: studentData.id,
      full_name: studentData.full_name,
      school: studentData.school,
      grade: studentData.grade
    };

    return { student };

  } catch (error) {
    console.error('💥 Student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};
