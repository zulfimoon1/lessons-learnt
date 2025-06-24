
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

const setPlatformAdminContext = async () => {
  // Check if platform admin is stored in localStorage
  const adminEmail = localStorage.getItem('platform_admin');
  if (adminEmail) {
    try {
      const adminData = JSON.parse(adminEmail);
      await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
    } catch (error) {
      console.log('No platform admin context available');
    }
  }
};

// Generate a consistent UUID for demo students based on their details
const generateDemoStudentId = (fullName: string, school: string, grade: string): string => {
  // Create a consistent hash-based UUID for demo students
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(`${fullName}-${school}-${grade}-demo`).digest('hex');
  // Convert hash to UUID format
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
};

export const secureStudentLogin = async (fullName: string, school: string, grade: string, password: string) => {
  console.log('🔐 SECURE STUDENT LOGIN:', { fullName, school, grade });
  
  try {
    // Set platform admin context if available
    await setPlatformAdminContext();

    // Handle demo student case first
    if (fullName.toLowerCase().includes('demo') && school.toLowerCase().includes('demo')) {
      console.log('✅ Demo student detected, allowing login');
      const demoId = generateDemoStudentId(fullName, school, grade);
      return {
        student: {
          id: demoId,
          full_name: fullName,
          school: school,
          grade: grade
        }
      };
    }

    // Query students table for matching student
    const { data: students, error: queryError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim());

    if (queryError) {
      console.error('Database query error:', queryError);
      throw new Error('Authentication failed');
    }

    if (!students || students.length === 0) {
      console.log('❌ Student not found');
      throw new Error('Invalid credentials');
    }

    const student = students[0];
    console.log('✅ Student found:', student.id);

    // Verify password using bcrypt or simple hash comparison
    let passwordValid = false;
    try {
      // Try bcrypt first
      passwordValid = await bcrypt.compare(password, student.password_hash);
    } catch (bcryptError) {
      console.log('Bcrypt failed, trying simple hash comparison');
      // Fallback to simple hash for existing passwords
      const crypto = await import('crypto');
      const simpleHash = crypto.createHash('sha256').update(password + 'simple_salt_2024').digest('hex');
      passwordValid = simpleHash === student.password_hash;
    }

    if (!passwordValid) {
      console.log('❌ Invalid password');
      throw new Error('Invalid credentials');
    }

    console.log('✅ Student authentication successful');
    return { student };

  } catch (error) {
    console.error('Student login error:', error);
    throw error;
  }
};

export const secureStudentSignup = async (fullName: string, school: string, grade: string, password: string) => {
  console.log('📝 SECURE STUDENT SIGNUP:', { fullName, school, grade });
  
  try {
    // Set platform admin context if available
    await setPlatformAdminContext();

    // Handle demo student case
    if (fullName.toLowerCase().includes('demo') && school.toLowerCase().includes('demo')) {
      console.log('✅ Demo student signup, creating demo student');
      const demoId = generateDemoStudentId(fullName, school, grade);
      return {
        student: {
          id: demoId,
          full_name: fullName,
          school: school,
          grade: grade
        }
      };
    }

    // Check if student already exists
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim());

    if (checkError) {
      console.error('Database check error:', checkError);
      throw new Error('Registration failed');
    }

    if (existingStudents && existingStudents.length > 0) {
      throw new Error('Student already exists');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new student
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
      throw new Error('Registration failed');
    }

    console.log('✅ Student created successfully:', newStudent.id);
    return { student: newStudent };

  } catch (error) {
    console.error('Student signup error:', error);
    throw error;
  }
};
