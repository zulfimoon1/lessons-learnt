
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from './securePasswordService';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Direct query to teachers table
    console.log('Querying teachers table directly...');
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    console.log('Direct query result:', { teachers, queryError });

    if (queryError) {
      console.error('Query error:', queryError);
      return { error: 'Authentication service error. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    
    // Use bcrypt to verify password
    const passwordMatch = await verifyPassword(password, teacher.password_hash);
    if (!passwordMatch) {
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
    
    // Direct query to students table
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
      return { error: 'Authentication service error. Please try again.' };
    }

    if (!students || students.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    
    // Use bcrypt to verify password
    const passwordMatch = await verifyPassword(password, student.password_hash);
    if (!passwordMatch) {
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
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    // Direct insert to teachers table
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
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    // Direct insert to students table
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
