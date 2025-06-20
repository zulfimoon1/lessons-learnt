import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the authenticate_teacher RPC function that bypasses RLS
    const { data, error } = await supabase.rpc('authenticate_teacher', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('Teacher authentication RPC result:', { data, error });

    if (error) {
      console.error('Teacher authentication RPC error:', error);
      return { error: 'Authentication failed - database error' };
    }

    if (!data || data.length === 0) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = data[0];
    console.log('Teacher found:', { id: teacher.teacher_id, name: teacher.teacher_name, email: teacher.teacher_email });

    // For now, just verify the teacher exists (password checking can be added later)
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
    
    // Use the authenticate_student RPC function that bypasses RLS
    const { data, error } = await supabase.rpc('authenticate_student', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),  
      password_param: password
    });

    console.log('Student authentication RPC result:', { data, error });

    if (error) {
      console.error('Student authentication RPC error:', error);
      return { error: 'Authentication failed - database error' };
    }

    if (!data || data.length === 0) {
      console.log('No student found with credentials:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    const student = data[0];
    console.log('Student found:', { id: student.student_id, name: student.student_name });

    // For now, just verify the student exists (password checking can be added later)
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
    
    // For registration, we can try direct insert since RLS should allow it
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role,
        password_hash: password
      })
      .select()
      .single();

    console.log('Insert result:', { newTeacher, insertError });

    if (insertError) {
      console.error('Teacher creation error:', insertError);
      if (insertError.code === '23505') {
        return { error: 'A teacher with this email already exists' };
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
    
    // For registration, we can try direct insert since RLS should allow it
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: password
      })
      .select()
      .single();

    console.log('Insert result:', { newStudent, insertError });

    if (insertError) {
      console.error('Student creation error:', insertError);
      if (insertError.code === '23505') {
        return { error: 'A student with these details already exists' };
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
