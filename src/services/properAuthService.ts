
import { supabase } from '@/integrations/supabase/client';

export const authenticateTeacher = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting teacher authentication for:', email);
    
    // Temporarily disable RLS for this query by using the service role context
    const { data: teachers, error: fetchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    console.log('Database query result:', { teachers, fetchError });

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return { error: 'Authentication failed - database error' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('No teacher found with email:', email);
      return { error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    console.log('Found teacher:', { id: teacher.id, name: teacher.name, email: teacher.email });
    
    // For now, just check if password matches (we'll improve this later)
    if (teacher.password_hash !== password) {
      console.log('Password does not match for teacher:', teacher.email);
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
    
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    console.log('Database query result:', { students, fetchError });

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return { error: 'Authentication failed - database error' };
    }

    if (!students || students.length === 0) {
      console.log('No student found with provided credentials');
      return { error: 'Invalid credentials' };
    }

    const student = students[0];
    console.log('Found student:', { id: student.id, name: student.full_name });
    
    if (student.password_hash !== password) {
      console.log('Password does not match for student:', student.full_name);
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
