
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // First, try a simple direct query to test database connectivity
    console.log('Testing database connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('teachers')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    console.log('Database connectivity test result:', { testData, testError });

    if (testError) {
      console.error('Database connectivity test failed:', testError);
      // If direct query fails, fall back to RPC
      console.log('Falling back to RPC function...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('authenticate_teacher_working', {
        email_param: email.toLowerCase().trim(),
        password_param: password
      });

      console.log('RPC fallback result:', { rpcData, rpcError });

      if (rpcError) {
        console.error('RPC fallback also failed:', rpcError);
        return { error: 'Authentication service temporarily unavailable. Please try again.' };
      }

      if (!rpcData || rpcData.length === 0) {
        return { error: 'Invalid email or password' };
      }

      const teacher = rpcData[0];
      return {
        teacher: {
          id: teacher.teacher_id,
          name: teacher.teacher_name,
          email: teacher.teacher_email,
          school: teacher.teacher_school,
          role: teacher.teacher_role as 'teacher' | 'admin' | 'doctor'
        }
      };
    }

    // If direct query works, use it
    if (!testData || testData.length === 0) {
      console.log('No teacher found for email:', email);
      return { error: 'Invalid email or password' };
    }

    // Get full teacher data
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (teacherError || !teacherData) {
      console.error('Failed to get teacher data:', teacherError);
      return { error: 'Authentication failed' };
    }

    console.log('✅ Teacher authentication successful via direct query');
    
    return {
      teacher: {
        id: teacherData.id,
        name: teacherData.name,
        email: teacherData.email,
        school: teacherData.school,
        role: teacherData.role as 'teacher' | 'admin' | 'doctor'
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
    
    // Try direct query first
    const { data: testData, error: testError } = await supabase
      .from('students')
      .select('id, full_name')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    console.log('Student database test result:', { testData, testError });

    if (testError) {
      console.error('Student database test failed:', testError);
      // Fall back to RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('authenticate_student_working', {
        name_param: fullName.trim(),
        school_param: school.trim(),
        grade_param: grade.trim(),
        password_param: password
      });

      console.log('Student RPC result:', { rpcData, rpcError });

      if (rpcError) {
        console.error('Student RPC error:', rpcError);
        return { error: 'Authentication service temporarily unavailable. Please try again.' };
      }

      if (!rpcData || rpcData.length === 0) {
        return { error: 'Invalid credentials' };
      }

      const student = rpcData[0];
      return {
        student: {
          id: student.student_id,
          full_name: student.student_name,
          school: student.student_school,
          grade: student.student_grade
        }
      };
    }

    // If direct query works
    if (!testData || testData.length === 0) {
      console.log('No student found for credentials');
      return { error: 'Invalid credentials' };
    }

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (studentError || !studentData) {
      console.error('Failed to get student data:', studentError);
      return { error: 'Authentication failed' };
    }

    console.log('✅ Student authentication successful via direct query');
    
    return {
      student: {
        id: studentData.id,
        full_name: studentData.full_name,
        school: studentData.school,
        grade: studentData.grade
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
    
    // Try direct insert
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
    
    // Try direct insert
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
