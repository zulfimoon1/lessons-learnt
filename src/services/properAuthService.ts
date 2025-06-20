
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Try to use RPC to test elevated access, then query teachers table
    let teachers, queryError;
    
    try {
      // Test if we have elevated access via RPC
      await supabase.rpc('get_platform_stats', { stat_type: 'teachers' });
      
      // If RPC works, we have elevated access, now query directly
      const result = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
      
      teachers = result.data;
      queryError = result.error;
    } catch (rpcError) {
      // If RPC fails, try direct query anyway
      const result = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
      
      teachers = result.data;
      queryError = result.error;
    }

    console.log('Teacher query result:', { teachers, queryError });

    if (queryError) {
      console.error('Teacher query error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('No teacher found for email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    console.log('Teacher found:', { id: teacher.id, email: teacher.email, role: teacher.role });

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, teacher.password_hash);
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
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role as 'teacher' | 'admin' | 'doctor'
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
    
    // Use a direct query with better error handling
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    console.log('Student query result:', { students, queryError });

    if (queryError) {
      console.error('Student query error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!students || students.length === 0) {
      console.log('No student found for:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    console.log('Student found:', { id: student.id, full_name: student.full_name });

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, student.password_hash);
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
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
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
    
    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing teacher:', checkError);
      return { error: 'Registration failed. Please try again.' };
    }

    if (existingTeachers && existingTeachers.length > 0) {
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
    
    // Check if student already exists
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing student:', checkError);
      return { error: 'Registration failed. Please try again.' };
    }

    if (existingStudents && existingStudents.length > 0) {
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
