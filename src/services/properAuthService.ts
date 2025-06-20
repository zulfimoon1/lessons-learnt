
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the secure authentication function that bypasses RLS
    const { data: teacherData, error: queryError } = await supabase.rpc('authenticate_teacher', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    console.log('Teacher authentication function result:', { teacherData, queryError });

    if (queryError) {
      console.error('Teacher authentication function error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!teacherData || teacherData.length === 0) {
      console.log('No teacher found for email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = teacherData[0];
    console.log('Teacher found:', { id: teacher.teacher_id, email: teacher.teacher_email, role: teacher.teacher_role });

    // Get the actual password hash for verification
    const { data: teacherRecord, error: fetchError } = await supabase
      .from('teachers')
      .select('password_hash')
      .eq('id', teacher.teacher_id)
      .single();

    if (fetchError || !teacherRecord) {
      console.error('Failed to fetch teacher password hash:', fetchError);
      return { error: 'Authentication failed' };
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, teacherRecord.password_hash);
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
    
    // Use the secure authentication function that bypasses RLS
    const { data: studentData, error: queryError } = await supabase.rpc('authenticate_student', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: password
    });

    console.log('Student authentication function result:', { studentData, queryError });

    if (queryError) {
      console.error('Student authentication function error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!studentData || studentData.length === 0) {
      console.log('No student found for:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    const student = studentData[0];
    console.log('Student found:', { id: student.student_id, full_name: student.student_name });

    // Get the actual password hash for verification
    const { data: studentRecord, error: fetchError } = await supabase
      .from('students')
      .select('password_hash')
      .eq('id', student.student_id)
      .single();

    if (fetchError || !studentRecord) {
      console.error('Failed to fetch student password hash:', fetchError);
      return { error: 'Authentication failed' };
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, studentRecord.password_hash);
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
    
    // Check if teacher already exists using the authentication function
    const { data: existingTeacher } = await supabase.rpc('authenticate_teacher', {
      email_param: email.toLowerCase().trim(),
      password_param: 'dummy' // We just want to check if user exists
    });

    if (existingTeacher && existingTeacher.length > 0) {
      return { error: 'A teacher with this email already exists' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create teacher record - this should work as it's an INSERT operation
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
    
    // Check if student already exists using the authentication function
    const { data: existingStudent } = await supabase.rpc('authenticate_student', {
      name_param: fullName.trim(),
      school_param: school.trim(),
      grade_param: grade.trim(),
      password_param: 'dummy' // We just want to check if user exists
    });

    if (existingStudent && existingStudent.length > 0) {
      return { error: 'A student with these details already exists' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create student record - this should work as it's an INSERT operation
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
