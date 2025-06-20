
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export const secureTeacherLogin = async (email: string, password: string) => {
  console.log('🔐 SECURE TEACHER LOGIN:', email);
  
  try {
    // Query teachers table for matching teacher
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (queryError) {
      console.error('Database query error:', queryError);
      throw new Error('Authentication failed');
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ Teacher not found');
      throw new Error('Invalid credentials');
    }

    const teacher = teachers[0];
    console.log('✅ Teacher found:', teacher.id, 'Role:', teacher.role);

    // Verify password using bcrypt or simple hash comparison
    let passwordValid = false;
    try {
      // Try bcrypt first
      passwordValid = await bcrypt.compare(password, teacher.password_hash);
    } catch (bcryptError) {
      console.log('Bcrypt failed, trying simple hash comparison');
      // Fallback to simple hash for existing passwords
      const crypto = await import('crypto');
      const simpleHash = crypto.createHash('sha256').update(password + 'simple_salt_2024').digest('hex');
      passwordValid = simpleHash === teacher.password_hash;
    }

    if (!passwordValid) {
      console.log('❌ Invalid password');
      throw new Error('Invalid credentials');
    }

    console.log('✅ Teacher authentication successful');
    return { teacher };

  } catch (error) {
    console.error('Teacher login error:', error);
    throw error;
  }
};

export const secureTeacherSignup = async (name: string, email: string, school: string, password: string, role: string = 'teacher') => {
  console.log('📝 SECURE TEACHER SIGNUP:', { name, email, school, role });
  
  try {
    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase().trim());

    if (checkError) {
      console.error('Database check error:', checkError);
      throw new Error('Registration failed');
    }

    if (existingTeachers && existingTeachers.length > 0) {
      throw new Error('Teacher already exists');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new teacher
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
      throw new Error('Registration failed');
    }

    console.log('✅ Teacher created successfully:', newTeacher.id);
    return { teacher: newTeacher };

  } catch (error) {
    console.error('Teacher signup error:', error);
    throw error;
  }
};
