
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from './securePasswordService';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the existing working authentication function
    const { data, error } = await supabase.rpc('authenticate_teacher_working', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('Teacher authentication function result:', { data, error });

    if (error) {
      console.error('Authentication function error:', error);
      return { error: 'Authentication service error. Please try again.' };
    }

    // Handle the response data properly - it should be an array of results
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const result = data[0];
    
    // Check if teacher exists and password is valid
    if (!result.teacher_id || !result.password_valid) {
      return { error: 'Invalid email or password' };
    }

    console.log('✅ Teacher authentication successful');
    
    return {
      teacher: {
        id: result.teacher_id,
        name: result.teacher_name,
        email: result.teacher_email,
        school: result.teacher_school,
        role: result.teacher_role as 'teacher' | 'admin' | 'doctor'
      }
    };

  } catch (error) {
    console.error('Teacher authentication error:', error);
    return { error: 'Authentication failed - server error' };
  }
};

export const authenticateStudent = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('🔐 Starting student authentication for:', { fullName, school, grade });
    
    // Use RPC function for student authentication
    const { data, error } = await supabase.rpc('authenticate_student_working', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: password
    });

    console.log('Student authentication RPC result:', { data, error });

    if (error) {
      console.error('Student authentication RPC error:', error);
      return { error: 'Authentication service error. Please try again.' };
    }

    // Handle the response data properly
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const result = data[0];
    console.log('Student authentication result:', result);
    
    // Check if student exists and password is valid
    if (!result.student_id || !result.password_valid) {
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Student authentication successful');
    
    return {
      student: {
        id: result.student_id,
        full_name: result.student_name,
        school: result.student_school,
        grade: result.student_grade
      }
    };

  } catch (error) {
    console.error('Student authentication error:', error);
    return { error: 'Authentication failed - server error' };
  }
};

export const registerTeacher = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 Starting teacher registration for:', { name, email, school, role });
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    // Direct insert to teachers table
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role,
        password_hash: hashedPassword
      })
      .select()
      .single();

    console.log('Teacher registration result:', { newTeacher, insertError });

    if (insertError) {
      console.error('Teacher registration error:', insertError);
      
      if (insertError.code === '23505') {
        return { error: 'A teacher with this email already exists' };
      }
      
      return { error: 'Failed to create teacher account. Please try again.' };
    }

    console.log('✅ Teacher registration successful');
    return {
      teacher: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        school: newTeacher.school,
        role: newTeacher.role as 'teacher' | 'admin' | 'doctor'
      }
    };

  } catch (error) {
    console.error('Teacher registration error:', error);
    return { error: 'Registration failed - server error' };
  }
};

export const registerStudent = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 Starting student registration for:', { fullName, school, grade });
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    // Direct insert to students table
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: hashedPassword
      })
      .select()
      .single();

    console.log('Student registration result:', { newStudent, insertError });

    if (insertError) {
      console.error('Student registration error:', insertError);
      
      if (insertError.code === '23505') {
        return { error: 'A student with these details already exists' };
      }
      
      return { error: 'Failed to create student account. Please try again.' };
    }

    console.log('✅ Student registration successful');
    return {
      student: {
        id: newStudent.id,
        full_name: newStudent.full_name,
        school: newStudent.school,
        grade: newStudent.grade
      }
    };

  } catch (error) {
    console.error('Student registration error:', error);
    return { error: 'Registration failed - server error' };
  }
};
