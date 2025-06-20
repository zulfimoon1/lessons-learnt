import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the database function to bypass RLS
    const { data: teacherData, error: queryError } = await supabase.rpc('authenticate_teacher', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('Teacher RPC result:', { teacherData, queryError });

    if (queryError) {
      console.error('Teacher RPC error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!teacherData || teacherData.length === 0) {
      console.log('No teacher found for email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = teacherData[0];
    console.log('Teacher found via RPC:', { id: teacher.teacher_id, email: teacher.teacher_email, role: teacher.teacher_role });

    // Now get the password hash with a direct query using proper admin context
    await supabase.rpc('set_platform_admin_context', {
      admin_email: 'system@auth.bypass'
    });

    const { data: passwordData, error: passwordError } = await supabase
      .from('teachers')
      .select('password_hash')
      .eq('id', teacher.teacher_id)
      .single();

    if (passwordError || !passwordData) {
      console.error('Password fetch error:', passwordError);
      return { error: 'Authentication failed' };
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, passwordData.password_hash);
      console.log('Password verification:', isPasswordValid ? 'success' : 'failed');
    } catch (bcryptError) {
      console.error('Password verification error:', bcryptError);
      return { error: 'Authentication failed' };
    }

    if (!isPasswordValid) {
      console.log('Invalid password for teacher:', email);
      return { error: 'Invalid email or password' };
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
    
    // Use the database function to bypass RLS
    const { data: studentData, error: queryError } = await supabase.rpc('authenticate_student', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: password
    });

    console.log('Student RPC result:', { studentData, queryError });

    if (queryError) {
      console.error('Student RPC error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!studentData || studentData.length === 0) {
      console.log('No student found for:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    const student = studentData[0];
    console.log('Student found via RPC:', { id: student.student_id, name: student.student_name });

    // Now get the password hash with a direct query using proper admin context
    await supabase.rpc('set_platform_admin_context', {
      admin_email: 'system@auth.bypass'
    });

    const { data: passwordData, error: passwordError } = await supabase
      .from('students')
      .select('password_hash')
      .eq('id', student.student_id)
      .single();

    if (passwordError || !passwordData) {
      console.error('Password fetch error:', passwordError);
      return { error: 'Authentication failed' };
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, passwordData.password_hash);
      console.log('Password verification:', isPasswordValid ? 'success' : 'failed');
    } catch (bcryptError) {
      console.error('Password verification error:', bcryptError);
      return { error: 'Authentication failed' };
    }

    if (!isPasswordValid) {
      console.log('Invalid password for student');
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
    
    // Set admin context for registration
    await supabase.rpc('set_platform_admin_context', {
      admin_email: 'system@auth.bypass'
    });

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingTeacher) {
      return { error: 'A teacher with this email already exists' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create teacher record
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

    if (insertError) {
      console.error('Teacher creation error:', insertError);
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
    
    // Set admin context for registration
    await supabase.rpc('set_platform_admin_context', {
      admin_email: 'system@auth.bypass'
    });

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .maybeSingle();

    if (existingStudent) {
      return { error: 'A student with these details already exists' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create student record
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

    if (insertError) {
      console.error('Student creation error:', insertError);
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
