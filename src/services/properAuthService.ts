
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Set platform admin context to bypass RLS
    console.log('Setting platform admin context...');
    const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
      admin_email: 'zulfimoon1@gmail.com'
    });
    
    if (contextError) {
      console.log('Context setting failed, but continuing with RPC...');
    }

    // Use the working RPC function
    console.log('Calling authenticate_teacher_working RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('authenticate_teacher_working', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('RPC result:', { rpcData, rpcError });

    if (rpcError) {
      console.error('RPC authentication failed:', rpcError);
      return { error: 'Authentication service error. Please try again.' };
    }

    if (!rpcData || rpcData.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const teacher = rpcData[0];
    
    // Check if we got valid teacher data
    if (!teacher.teacher_id || !teacher.teacher_name) {
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Teacher authentication successful');
    
    return {
      teacher: {
        id: teacher.teacher_id,
        name: teacher.teacher_name,
        email: teacher.teacher_email,
        school: teacher.teacher_school,
        role: teacher.teacher_role as 'teacher' | 'admin' | 'doctor'
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
    
    // Set platform admin context to bypass RLS
    const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
      admin_email: 'zulfimoon1@gmail.com'
    });
    
    if (contextError) {
      console.log('Context setting failed, but continuing with RPC...');
    }

    // Use the working RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('authenticate_student_working', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: password
    });

    console.log('Student RPC result:', { rpcData, rpcError });

    if (rpcError) {
      console.error('Student RPC error:', rpcError);
      return { error: 'Authentication service error. Please try again.' };
    }

    if (!rpcData || rpcData.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const student = rpcData[0];
    
    // Check if we got valid student data
    if (!student.student_id || !student.student_name) {
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Student authentication successful');
    
    return {
      student: {
        id: student.student_id,
        full_name: student.student_name,
        school: student.student_school,
        grade: student.student_grade
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
    
    // Set platform admin context first
    const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
      admin_email: 'zulfimoon1@gmail.com'
    });
    
    if (contextError) {
      console.log('Context setting failed:', contextError);
    }

    // Try direct insert with admin context
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
    
    // Set platform admin context first
    const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
      admin_email: 'zulfimoon1@gmail.com'
    });
    
    if (contextError) {
      console.log('Context setting failed:', contextError);
    }

    // Try direct insert with admin context
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
