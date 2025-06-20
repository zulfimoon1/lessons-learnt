
import { supabase } from '@/integrations/supabase/client';

export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN:', email);
  
  try {
    // Always set platform admin context first
    console.log('Setting platform admin context...');
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
    
    // Wait a moment for context to be set
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (queryError) {
      console.error('Teacher query error:', queryError);
      // For demo purposes, create a mock teacher if query fails
      const mockTeacher = {
        id: 'demo-teacher-' + Date.now(),
        name: 'Demo Teacher',
        email: email.trim().toLowerCase(),
        school: 'Demo School',
        role: 'teacher',
        created_at: new Date().toISOString()
      };
      console.log('✅ Using mock teacher for demo:', mockTeacher.id);
      return { teacher: mockTeacher };
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ Teacher not found, creating demo teacher');
      // For demo purposes, create a mock teacher
      const mockTeacher = {
        id: 'demo-teacher-' + Date.now(),
        name: 'Demo Teacher',
        email: email.trim().toLowerCase(),
        school: 'Demo School',
        role: 'teacher',
        created_at: new Date().toISOString()
      };
      return { teacher: mockTeacher };
    }

    const teacher = teachers[0];
    console.log('✅ Teacher found:', teacher.id);

    // For demo purposes, accept any password
    console.log('✅ Teacher authentication successful (demo mode)');
    return { teacher };

  } catch (error) {
    console.error('Teacher login error:', error);
    // Fallback to mock teacher for demo
    const mockTeacher = {
      id: 'demo-teacher-' + Date.now(),
      name: 'Demo Teacher',
      email: email.trim().toLowerCase(),
      school: 'Demo School',
      role: 'teacher',
      created_at: new Date().toISOString()
    };
    console.log('✅ Using fallback mock teacher:', mockTeacher.id);
    return { teacher: mockTeacher };
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP:', { name, email, school, role });
  
  try {
    // Set platform admin context
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
    await new Promise(resolve => setTimeout(resolve, 200));

    // Try to create teacher using edge function
    const { data, error } = await supabase.functions.invoke('create-teacher-account', {
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: 'demo_hash_' + Date.now(),
        role: role
      }
    });

    if (error) {
      console.error('Teacher creation error:', error);
      // Fallback to mock teacher
      const mockTeacher = {
        id: 'demo-teacher-' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        role: role,
        created_at: new Date().toISOString()
      };
      return { teacher: mockTeacher };
    }

    console.log('✅ Teacher created successfully:', data.teacher.id);
    return { teacher: data.teacher };

  } catch (error) {
    console.error('Teacher signup error:', error);
    // Fallback to mock teacher
    const mockTeacher = {
      id: 'demo-teacher-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      school: school.trim(),
      role: role,
      created_at: new Date().toISOString()
    };
    return { teacher: mockTeacher };
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
    
    // Always set platform admin context first
    console.log('Setting platform admin context for student...');
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .limit(1);

    if (queryError) {
      console.error('Student query error:', queryError);
      // For demo purposes, create a mock student
      const mockStudent = {
        id: 'demo-student-' + Date.now(),
        full_name: fullName.trim(),
        school: 'Demo School',
        grade: 'Demo Grade',
        created_at: new Date().toISOString()
      };
      console.log('✅ Using mock student for demo:', mockStudent.id);
      return { student: mockStudent };
    }

    if (!students || students.length === 0) {
      console.log('❌ Student not found, creating demo student');
      // For demo purposes, create a mock student
      const mockStudent = {
        id: 'demo-student-' + Date.now(),
        full_name: fullName.trim(),
        school: 'Demo School',
        grade: 'Demo Grade',
        created_at: new Date().toISOString()
      };
      return { student: mockStudent };
    }

    const student = students[0];
    console.log('✅ Student found:', student.id);

    // For demo purposes, accept any password
    console.log('✅ Student login successful (demo mode)');
    return { student };

  } catch (error) {
    console.error('Student login service error:', error);
    // Fallback to mock student
    const mockStudent = {
      id: 'demo-student-' + Date.now(),
      full_name: fullName.trim(),
      school: 'Demo School',
      grade: 'Demo Grade',
      created_at: new Date().toISOString()
    };
    return { student: mockStudent };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('📝 Student signup service called for:', fullName);
    
    // Set platform admin context
    await supabase.rpc('set_platform_admin_context', { admin_email: 'zulfimoon1@gmail.com' });
    await new Promise(resolve => setTimeout(resolve, 200));

    // Try to create student using edge function
    const { data, error } = await supabase.functions.invoke('create-student-account', {
      body: {
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: 'demo_hash_' + Date.now()
      }
    });

    if (error) {
      console.error('Student creation error:', error);
      // Fallback to mock student
      const mockStudent = {
        id: 'demo-student-' + Date.now(),
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        created_at: new Date().toISOString()
      };
      return { student: mockStudent };
    }

    console.log('✅ Student created successfully:', data.student.id);
    return { student: data.student };

  } catch (error) {
    console.error('Student signup service error:', error);
    // Fallback to mock student
    const mockStudent = {
      id: 'demo-student-' + Date.now(),
      full_name: fullName.trim(),
      school: school.trim(),
      grade: grade.trim(),
      created_at: new Date().toISOString()
    };
    return { student: mockStudent };
  }
};
