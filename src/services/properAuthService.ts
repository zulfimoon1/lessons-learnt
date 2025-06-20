
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Use direct table query instead of RPC function
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, email, school, role')
      .eq('email', email.toLowerCase().trim())
      .single();

    console.log('Teacher authentication result:', { data, error });

    if (error) {
      console.error('Teacher authentication error:', error);
      if (error.code === 'PGRST116') {
        return { error: 'Invalid email or password' };
      }
      return { error: 'Authentication failed - server error' };
    }

    if (!data) {
      console.log('No teacher found');
      return { error: 'Invalid email or password' };
    }

    console.log('✅ Teacher authentication successful');
    return {
      teacher: {
        id: data.id,
        name: data.name,
        email: data.email,
        school: data.school,
        role: data.role as 'teacher' | 'admin' | 'doctor'
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
    
    // Use direct table query instead of RPC function
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, school, grade')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    console.log('Student authentication result:', { data, error });

    if (error) {
      console.error('Student authentication error:', error);
      if (error.code === 'PGRST116') {
        return { error: 'Invalid credentials' };
      }
      return { error: 'Authentication failed - server error' };
    }

    if (!data) {
      console.log('No student found');
      return { error: 'Invalid credentials' };
    }

    console.log('✅ Student authentication successful');
    return {
      student: {
        id: data.id,
        full_name: data.full_name,
        school: data.school,
        grade: data.grade
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
    
    // Direct insert to teachers table
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
    
    // Direct insert to students table
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
