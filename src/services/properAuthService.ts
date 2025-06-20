
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use Supabase's built-in auth system for the initial connection
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.log('Auth error, trying database fallback:', authError.message);
      
      // Fallback to direct database query with service role access
      const { data: teachers, error: queryError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (queryError || !teachers) {
        console.error('Teacher query error:', queryError);
        return { error: 'Invalid email or password' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, teachers.password_hash);
      
      if (!isPasswordValid) {
        console.log('Invalid password for teacher:', email);
        return { error: 'Invalid email or password' };
      }

      console.log('✅ Teacher authentication successful via database');
      return {
        teacher: {
          id: teachers.id,
          name: teachers.name,
          email: teachers.email,
          school: teachers.school,
          role: teachers.role as 'teacher' | 'admin' | 'doctor'
        }
      };
    }

    // If auth successful, get teacher data
    const { data: teachers, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (teacherError || !teachers) {
      console.error('Teacher data fetch error:', teacherError);
      return { error: 'Teacher account not found' };
    }

    console.log('✅ Teacher authentication successful via Supabase Auth');
    return {
      teacher: {
        id: teachers.id,
        name: teachers.name,
        email: teachers.email,
        school: teachers.school,
        role: teachers.role as 'teacher' | 'admin' | 'doctor'
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
    
    // For students, we'll use direct database authentication since they don't have email-based auth
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (queryError || !students) {
      console.log('No student found for:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, students.password_hash);
    
    if (!isPasswordValid) {
      console.log('Invalid password for student');
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Student authentication successful');
    return {
      student: {
        id: students.id,
        full_name: students.full_name,
        school: students.school,
        grade: students.grade
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
    
    // First try to create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          school: school,
          role: role
        }
      }
    });

    if (authError && authError.message !== 'User already registered') {
      console.log('Auth signup error, proceeding with direct database insert:', authError.message);
    }

    // Check if teacher already exists
    const { data: existingTeachers } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingTeachers) {
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
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    if (existingStudents) {
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
