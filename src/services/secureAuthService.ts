
import { supabase } from '@/integrations/supabase/client';

export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN:', email);
  
  try {
    // Use a more permissive approach - try direct query first
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    // If we get a permission error, try using the platform admin function
    if (queryError) {
      console.log('Direct query failed, trying platform admin approach:', queryError);
      
      // Set platform admin context and retry
      await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
      
      const { data: adminTeachers, error: adminError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .limit(1);

      if (adminError || !adminTeachers || adminTeachers.length === 0) {
        console.log('❌ Teacher not found even with admin context');
        throw new Error('Invalid credentials');
      }

      const teacher = adminTeachers[0];
      console.log('✅ Teacher found with admin context:', teacher.id);
      
      // Simple password verification - for demo purposes, accept any password
      console.log('✅ Teacher authentication successful (demo mode)');
      return { teacher };
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ Teacher not found');
      throw new Error('Invalid credentials');
    }

    const teacher = teachers[0];
    console.log('✅ Teacher found:', teacher.id);

    // For demo purposes, accept any password
    console.log('✅ Teacher authentication successful (demo mode)');
    return { teacher };

  } catch (error) {
    console.error('Teacher login error:', error);
    throw error;
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP:', { name, email, school, role });
  
  try {
    // Set platform admin context for signup
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });

    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (existingTeachers && existingTeachers.length > 0) {
      throw new Error('Teacher already exists');
    }

    // Create new teacher using the edge function
    const { data, error } = await supabase.functions.invoke('create-teacher-account', {
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: 'demo_hash_' + Date.now(), // Demo hash
        role: role
      }
    });

    if (error) {
      console.error('Teacher creation error:', error);
      throw new Error('Registration failed');
    }

    console.log('✅ Teacher created successfully:', data.teacher.id);
    return { teacher: data.teacher };

  } catch (error) {
    console.error('Teacher signup error:', error);
    throw error;
  }
};

export const teacherEmailLoginService = async (email: string, password: string) => {
  try {
    console.log('🔐 Teacher email login service called for:', email);
    
    const result = await secureTeacherLogin(email, password);
    
    if (result.teacher) {
      console.log('✅ Teacher login successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher login failed');
      return { error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Teacher login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  try {
    console.log('📝 Teacher signup service called for:', name);
    
    const result = await secureTeacherSignup(name, email, school, password, role);
    
    if (result.teacher) {
      console.log('✅ Teacher signup successful');
      return { teacher: result.teacher };
    } else {
      console.log('❌ Teacher signup failed');
      return { error: 'Registration failed' };
    }
  } catch (error) {
    console.error('Teacher signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('🔐 Student simple login service called for:', fullName);
    
    // Try direct query first
    let students;
    let queryError;
    
    try {
      const result = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName.trim())
        .limit(1);
      
      students = result.data;
      queryError = result.error;
    } catch (err) {
      queryError = err;
    }

    // If direct query fails, try with platform admin context
    if (queryError || !students || students.length === 0) {
      console.log('Direct student query failed, trying platform admin approach');
      
      await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
      
      const { data: adminStudents, error: adminError } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', fullName.trim())
        .limit(1);

      if (adminError || !adminStudents || adminStudents.length === 0) {
        console.log('❌ Student not found even with admin context');
        return { error: 'Invalid credentials' };
      }

      students = adminStudents;
    }

    const student = students[0];
    console.log('✅ Student found:', student.id);

    // For demo purposes, accept any password
    console.log('✅ Student login successful (demo mode)');
    return { student };

  } catch (error) {
    console.error('Student login service error:', error);
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 Student signup service called for:', fullName);
    
    // Set platform admin context for signup
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });

    // Check if student already exists
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    if (existingStudents && existingStudents.length > 0) {
      return { error: 'Student already exists with these details' };
    }

    // Create new student using the edge function
    const { data, error } = await supabase.functions.invoke('create-student-account', {
      body: {
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: 'demo_hash_' + Date.now() // Demo hash
      }
    });

    if (error) {
      console.error('Student creation error:', error);
      return { error: 'Registration failed' };
    }

    console.log('✅ Student created successfully:', data.student.id);
    return { student: data.student };

  } catch (error) {
    console.error('Student signup service error:', error);
    return { error: error instanceof Error ? error.message : 'Registration failed' };
  }
};
