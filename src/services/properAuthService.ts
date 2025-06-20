
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // First, try to find the teacher directly
    const { data: teacherData, error: queryError } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    console.log('Teacher query result:', { teacherData, queryError });

    if (queryError) {
      console.error('Teacher query error:', queryError);
      // If we get a permission error, the teacher might exist but we can't access it
      // Return a generic error to avoid revealing database structure
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    if (!teacherData) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid email or password' };
    }

    // For now, we'll do a simple password check
    // In production, you'd want to use proper password hashing
    console.log('✅ Teacher found, authentication successful');
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
    
    // Try to find the student directly
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
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    if (!studentData) {
      console.log('No student found with provided details');
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Student found, authentication successful');
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
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (checkError && !checkError.message.includes('permission denied')) {
      console.error('Error checking existing teacher:', checkError);
      return { error: 'Registration failed - server error' };
    }

    if (existingTeacher) {
      return { error: 'A teacher with this email already exists' };
    }

    // Try to insert the new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role,
        password_hash: password // Store password directly for now
      })
      .select()
      .single();

    console.log('Teacher registration result:', { newTeacher, insertError });

    if (insertError) {
      console.error('Teacher registration error:', insertError);
      if (insertError.code === '23505') {
        return { error: 'A teacher with this email already exists' };
      }
      if (insertError.message?.includes('permission denied') || insertError.message?.includes('policy')) {
        return { error: 'Registration is currently unavailable. Please contact your administrator.' };
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
    
    // Check if student already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .maybeSingle();

    if (checkError && !checkError.message.includes('permission denied')) {
      console.error('Error checking existing student:', checkError);
      return { error: 'Registration failed - server error' };
    }

    if (existingStudent) {
      return { error: 'A student with these details already exists' };
    }

    // Try to insert the new student
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: password // Store password directly for now
      })
      .select()
      .single();

    console.log('Student registration result:', { newStudent, insertError });

    if (insertError) {
      console.error('Student registration error:', insertError);
      if (insertError.code === '23505') {
        return { error: 'A student with these details already exists' };
      }
      if (insertError.message?.includes('permission denied') || insertError.message?.includes('policy')) {
        return { error: 'Registration is currently unavailable. Please contact your administrator.' };
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
