
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the database function that bypasses RLS
    const { data, error } = await supabase.rpc('authenticate_teacher_complete', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('Teacher auth RPC result:', { data, error });

    if (error) {
      console.error('Teacher authentication RPC error:', error);
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    if (!data || data.length === 0) {
      console.log('No teacher data returned from RPC');
      return { error: 'Invalid email or password' };
    }

    const teacherData = Array.isArray(data) ? data[0] : data;
    
    if (!teacherData.success) {
      console.log('Authentication failed:', teacherData.error_message);
      return { error: teacherData.error_message || 'Invalid email or password' };
    }

    console.log('✅ Teacher authentication successful');
    return {
      teacher: {
        id: teacherData.teacher_id,
        name: teacherData.teacher_name,
        email: teacherData.teacher_email,
        school: teacherData.teacher_school,
        role: teacherData.teacher_role as 'teacher' | 'admin' | 'doctor'
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
    
    // Use the database function that bypasses RLS
    const { data, error } = await supabase.rpc('authenticate_student_complete', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: password
    });

    console.log('Student auth RPC result:', { data, error });

    if (error) {
      console.error('Student authentication RPC error:', error);
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    if (!data || data.length === 0) {
      console.log('No student data returned from RPC');
      return { error: 'Invalid credentials' };
    }

    const studentData = Array.isArray(data) ? data[0] : data;
    
    if (!studentData.success) {
      console.log('Student authentication failed:', studentData.error_message);
      return { error: studentData.error_message || 'Invalid credentials' };
    }

    console.log('✅ Student authentication successful');
    return {
      student: {
        id: studentData.student_id,
        full_name: studentData.student_name,
        school: studentData.student_school,
        grade: studentData.student_grade
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
    
    // Direct insert using Supabase client - let RLS handle permissions
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role,
        password_hash: password // Note: In production, hash this properly
      })
      .select()
      .single();

    console.log('Teacher registration result:', { newTeacher, insertError });

    if (insertError) {
      console.error('Teacher registration error:', insertError);
      
      if (insertError.code === '23505') {
        return { error: 'A teacher with this email already exists' };
      }
      
      if (insertError.message?.includes('permission denied')) {
        return { error: 'Registration is currently unavailable. Please contact your administrator.' };
      }
      
      return { error: 'Failed to create teacher account' };
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
    
    // Direct insert using Supabase client - let RLS handle permissions
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: password // Note: In production, hash this properly
      })
      .select()
      .single();

    console.log('Student registration result:', { newStudent, insertError });

    if (insertError) {
      console.error('Student registration error:', insertError);
      
      if (insertError.code === '23505') {
        return { error: 'A student with these details already exists' };
      }
      
      if (insertError.message?.includes('permission denied')) {
        return { error: 'Registration is currently unavailable. Please contact your administrator.' };
      }
      
      return { error: 'Failed to create student account' };
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
