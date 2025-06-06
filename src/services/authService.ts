
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

export const teacherLoginService = async (
  email: string, 
  password: string,
  name?: string,
  school?: string,
  role?: 'teacher' | 'admin'
) => {
  try {
    console.log('teacherLoginService: Starting login for email:', email);
    
    // First check if a teacher with this email exists
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email);

    if (queryError) {
      console.error('teacherLoginService: Database query error:', queryError);
      return { error: 'Database error occurred. Please try again.' };
    }

    console.log('teacherLoginService: Found teachers:', teachers?.length || 0);

    // If no teacher exists with this email, create one (auto-signup)
    if (!teachers || teachers.length === 0) {
      console.log('teacherLoginService: No existing teacher found, creating new one');
      
      // Ensure we have all required data for signup
      if (!name || !school) {
        console.log('teacherLoginService: Missing required signup data');
        return { error: 'Missing required fields for signup. Please provide name and school.' };
      }

      const { data: newTeacher, error: createError } = await supabase
        .from('teachers')
        .insert({
          email: email,
          password_hash: password, // In production, this should be properly hashed
          name: name,
          school: school,
          role: role || 'teacher'
        })
        .select()
        .single();

      if (createError) {
        console.error('teacherLoginService: Error creating teacher:', createError);
        return { error: 'Failed to create account. Please try again.' };
      }

      const teacherData: Teacher = {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        school: newTeacher.school,
        role: newTeacher.role as 'teacher' | 'admin'
      };

      console.log('teacherLoginService: New teacher created successfully:', teacherData);
      return { teacher: teacherData };
    }

    // Otherwise, check password and login
    const teacher = teachers[0];
    console.log('teacherLoginService: Checking password for existing teacher');
    
    if (teacher.password_hash !== password) {
      console.log('teacherLoginService: Password mismatch');
      return { error: 'Invalid email or password' };
    }

    const teacherData: Teacher = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      school: teacher.school,
      role: teacher.role as 'teacher' | 'admin'
    };

    console.log('teacherLoginService: Login successful for teacher:', teacherData);
    return { teacher: teacherData };
  } catch (error) {
    console.error('teacherLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('studentSignupService: Starting signup for:', fullName);
    
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        full_name: fullName,
        school: school,
        grade: grade,
        password_hash: password
      })
      .select()
      .single();

    if (error) {
      console.error('studentSignupService: Database error:', error);
      if (error.code === '23505') {
        return { error: 'A student with this name already exists in this school and grade.' };
      }
      return { error: 'Signup failed. Please try again.' };
    }

    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    console.log('studentSignupService: Student signup successful:', studentData);
    return { student: studentData };
  } catch (error) {
    console.error('studentSignupService: Unexpected error:', error);
    return { error: 'An unexpected error occurred during signup.' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('studentSimpleLoginService: Starting login for:', fullName);
    
    // First, find all students with the matching name
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName);

    if (error) {
      console.error('studentSimpleLoginService: Database error:', error);
      return { error: 'Database error occurred. Please try again.' };
    }

    console.log('studentSimpleLoginService: Students found with matching name:', students?.length || 0);

    if (!students || students.length === 0) {
      console.log('studentSimpleLoginService: No student found with matching name');
      return { error: 'Student not found. Please check your name or sign up first.' };
    }

    // Now check password for each student until we find a match
    const matchingStudent = students.find(student => student.password_hash === password);
    
    if (!matchingStudent) {
      console.log('studentSimpleLoginService: Password does not match for any student with this name');
      return { error: 'Invalid password. Please check your credentials.' };
    }

    console.log('studentSimpleLoginService: Login successful for student:', matchingStudent.id);

    const studentData: Student = {
      id: matchingStudent.id,
      full_name: matchingStudent.full_name,
      school: matchingStudent.school,
      grade: matchingStudent.grade
    };

    return { student: studentData };
  } catch (error) {
    console.error('studentSimpleLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred during login.' };
  }
};
