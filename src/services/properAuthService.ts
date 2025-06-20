
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use the existing authenticate_teacher function
    const { data, error } = await supabase.rpc('authenticate_teacher', {
      email_param: email.toLowerCase().trim(),
      password_param: password
    });

    if (error) {
      console.error('Teacher authentication RPC error:', error);
      return { error: 'Authentication failed - server error' };
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data returned from authentication');
      return { error: 'Invalid email or password' };
    }

    const result = data[0];
    
    // Get the teacher data from the database directly
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (teacherError || !teacherData) {
      console.log('Teacher not found:', teacherError);
      return { error: 'Invalid email or password' };
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, teacherData.password_hash);
    
    if (!isPasswordValid) {
      console.log('Authentication failed: Invalid password');
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
    
    // Get the student data from the database directly
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (studentError || !studentData) {
      console.log('Student not found:', studentError);
      return { error: 'Invalid credentials' };
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, studentData.password_hash);
    
    if (!isPasswordValid) {
      console.log('Student authentication failed: Invalid password');
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
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Use a simple insert since we don't have a registration RPC function
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
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Use a simple insert since we don't have a registration RPC function
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
