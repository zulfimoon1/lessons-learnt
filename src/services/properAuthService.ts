
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use direct query with proper error handling
    const { data: teacherData, error: queryError } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    console.log('Teacher query result:', { teacherData, queryError });

    if (queryError) {
      console.error('Teacher query error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!teacherData) {
      console.log('No teacher found for email:', email);
      return { error: 'Invalid email or password' };
    }

    console.log('Teacher found:', { id: teacherData.id, email: teacherData.email, role: teacherData.role });

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, teacherData.password_hash);
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
    
    // Use direct query with proper error handling
    const { data: studentData, error: queryError } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .maybeSingle();

    console.log('Student query result:', { studentData, queryError });

    if (queryError) {
      console.error('Student query error:', queryError);
      return { error: 'Unable to authenticate. Please check your credentials.' };
    }

    if (!studentData) {
      console.log('No student found for:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    console.log('Student found:', { id: studentData.id, full_name: studentData.full_name });

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, studentData.password_hash);
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
