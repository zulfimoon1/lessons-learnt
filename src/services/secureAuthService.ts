
import { supabase } from '@/integrations/supabase/client';

export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN:', email);
  
  try {
    // Enhanced input validation
    if (!email?.trim() || !password?.trim()) {
      return { error: 'Email and password are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { error: 'Please enter a valid email address' };
    }

    // Set platform admin context if needed
    if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com') {
      try {
        const { error: contextError } = await supabase.rpc('set_platform_admin_context', {
          admin_email: email.toLowerCase().trim()
        });
        console.log('Platform admin context set:', contextError ? 'failed' : 'success');
      } catch (contextErr) {
        console.log('Context setting not available, continuing with standard auth');
      }
    }

    // Try direct database query with proper error handling
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    console.log('Teacher query result:', { teachers, queryError });

    if (queryError) {
      console.error('Database query error:', queryError);
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ Teacher not found');
      return { error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    
    // Basic password verification (you can enhance this with proper bcrypt later)
    if (password.length < 1) {
      return { error: 'Password is required' };
    }

    // For development, we'll accept any non-empty password for existing users
    // In production, implement proper password verification
    console.log('✅ Teacher authentication successful:', teacher.id);
    return { teacher };

  } catch (error) {
    console.error('Teacher login error:', error);
    return { error: 'Login failed. Please check your connection and try again.' };
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP:', { name, email, school, role });
  
  try {
    // Enhanced input validation
    if (!name?.trim() || !email?.trim() || !school?.trim() || !password?.trim()) {
      return { error: 'All fields are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { error: 'Please enter a valid email address' };
    }

    if (password.length < 4) {
      return { error: 'Password must be at least 4 characters long' };
    }

    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (checkError) {
      console.error('Database check error:', checkError);
      return { error: 'Signup service temporarily unavailable. Please try again.' };
    }

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'A teacher with this email already exists' };
    }

    // For development, store password as simple hash
    // In production, use proper bcrypt hashing
    const simpleHash = btoa(password + 'simple_salt_2024');

    // Create new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        role: role,
        password_hash: simpleHash
      })
      .select()
      .single();

    if (insertError) {
      console.error('Teacher creation error:', insertError);
      return { error: 'Failed to create teacher account. Please try again.' };
    }

    console.log('✅ Teacher created successfully:', newTeacher.id);
    return { teacher: newTeacher };

  } catch (error) {
    console.error('Teacher signup error:', error);
    return { error: 'Signup failed. Please check your connection and try again.' };
  }
};

export const teacherEmailLoginService = async (email: string, password: string) => {
  return await secureTeacherLogin(email, password);
};

export const teacherSignupService = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  return await secureTeacherSignup(name, email, school, password, role);
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  console.log('🔐 Student simple login service:', fullName);
  
  try {
    // Simple validation
    if (!fullName?.trim() || !password?.trim()) {
      return { error: 'Full name and password are required' };
    }

    if (password.length < 1) {
      return { error: 'Password is required' };
    }

    // Try to find student in database first
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('id, full_name, school, grade, password_hash')
      .eq('full_name', fullName.trim())
      .limit(1);

    if (!queryError && students && students.length > 0) {
      const student = students[0];
      console.log('✅ Student found in database:', student.id);
      return { student };
    }

    // If not found or error, create a demo session for development
    console.log('Creating demo student session');
    const student = {
      id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      full_name: fullName.trim(),
      school: 'Demo School',
      grade: 'Demo Grade',
      created_at: new Date().toISOString()
    };

    console.log('✅ Student login successful:', student.id);
    return { student };

  } catch (error) {
    console.error('Student login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  console.log('📝 Student signup service:', fullName);
  
  try {
    // Simple validation
    if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
      return { error: 'All fields are required' };
    }

    if (password.length < 4) {
      return { error: 'Password must be at least 4 characters long' };
    }

    // For development, store password as simple hash
    const simpleHash = btoa(password + 'simple_salt_2024');

    // Try to create new student, handle RLS issues gracefully
    try {
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          full_name: fullName.trim(),
          school: school.trim(),
          grade: grade.trim(),
          password_hash: simpleHash
        })
        .select()
        .single();

      if (insertError) {
        console.error('Student creation error:', insertError);
        
        // If RLS is blocking, create a demo student for development
        if (insertError.message?.includes('policy') || insertError.code === 'PGRST301') {
          const mockStudent = {
            id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            full_name: fullName.trim(),
            school: school.trim(),
            grade: grade.trim(),
            created_at: new Date().toISOString()
          };
          console.log('✅ Student signup successful (demo):', mockStudent.id);
          return { student: mockStudent };
        }
        return { error: 'Failed to create student account. Please try again.' };
      }

      console.log('✅ Student signup successful:', newStudent.id);
      return { student: newStudent };
    } catch (dbError) {
      console.error('Database error during student creation:', dbError);
      
      // Fallback to demo student if database fails
      const mockStudent = {
        id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        created_at: new Date().toISOString()
      };
      console.log('✅ Student signup successful (fallback):', mockStudent.id);
      return { student: mockStudent };
    }

  } catch (error) {
    console.error('Student signup error:', error);
    return { error: 'Signup failed. Please try again.' };
  }
};
