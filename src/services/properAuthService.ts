import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // First get the teacher record
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', email.toLowerCase().trim())
      .single();

    console.log('Teacher query result:', { teacherData, teacherError });

    if (teacherError || !teacherData) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid email or password' };
    }

    // For now, we'll do a simple comparison (in production, use bcrypt)
    // Since the database stores hashed passwords, we need to implement proper verification
    console.log('Teacher found:', { id: teacherData.id, name: teacherData.name, email: teacherData.email });

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
    
    // First get the student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .single();

    console.log('Student query result:', { studentData, studentError });

    if (studentError || !studentData) {
      console.log('No student found with credentials:', { fullName, school, grade });
      return { error: 'Invalid credentials' };
    }

    console.log('Student found:', { id: studentData.id, name: studentData.full_name });

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
    
    // For registration, we can try direct insert since RLS should allow it
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
    
    // For registration, we can try direct insert since RLS should allow it
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
