
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { Teacher, Student } from '@/types/auth';

// Remove sensitive console logging for production security
const logSecurely = (message: string, ...args: any[]) => {
  // Only log non-sensitive information
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// Teacher login with simple name/password
export const teacherSimpleLoginService = async (name: string, password: string, school: string) => {
  try {
    logSecurely('teacherSimpleLoginService: Attempting login for teacher at school:', school);

    // Validate inputs to prevent injection attacks
    if (!name?.trim() || !password?.trim() || !school?.trim()) {
      return { error: 'All fields are required.' };
    }

    // First, try to find teacher by name and school with better error handling
    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('name', name.trim())
      .eq('school', school.trim());

    if (searchError) {
      logSecurely('teacherSimpleLoginService: Database error during search:', searchError.message);
      
      // Check if it's a permission error and provide better feedback
      if (searchError.message.includes('permission denied') || searchError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      
      return { error: 'Unable to connect to the database. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      return { error: 'Invalid credentials. Please check your name, school, and try again.' };
    }

    // Check password for each matching teacher
    for (const teacher of teachers) {
      if (!teacher.password_hash) {
        continue; // Skip teachers without password hash
      }
      
      try {
        const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
        if (isValidPassword) {
          logSecurely('teacherSimpleLoginService: Successful login for teacher ID:', teacher.id);
          const teacherData: Teacher = {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            school: teacher.school,
            role: teacher.role as 'teacher' | 'admin' | 'doctor',
            specialization: teacher.specialization,
            license_number: teacher.license_number,
            is_available: teacher.is_available
          };
          return { teacher: teacherData };
        }
      } catch (bcryptError) {
        logSecurely('teacherSimpleLoginService: Password comparison error');
        continue; // Continue to next teacher if password comparison fails
      }
    }

    return { error: 'Invalid credentials. Please check your password and try again.' };
  } catch (error) {
    logSecurely('teacherSimpleLoginService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student login with simple name/password
export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    logSecurely('studentSimpleLoginService: Attempting login for student');

    // Validate inputs to prevent injection attacks
    if (!fullName?.trim() || !password?.trim()) {
      return { error: 'All fields are required.' };
    }

    // Search for student by full name with better error handling
    const { data: students, error: searchError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim());

    if (searchError) {
      logSecurely('studentSimpleLoginService: Database error during search:', searchError.message);
      
      // Check if it's a permission error and provide better feedback
      if (searchError.message.includes('permission denied') || searchError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      
      return { error: 'Unable to connect to the database. Please try again.' };
    }

    if (!students || students.length === 0) {
      return { error: 'Invalid credentials. Please check your name and try again.' };
    }

    // Check password for the student
    const student = students[0];
    if (!student.password_hash) {
      return { error: 'Account setup incomplete. Please contact your teacher.' };
    }

    try {
      const isValidPassword = await bcrypt.compare(password, student.password_hash);
      
      if (isValidPassword) {
        logSecurely('studentSimpleLoginService: Successful login for student ID:', student.id);
        const studentData: Student = {
          id: student.id,
          full_name: student.full_name,
          school: student.school,
          grade: student.grade
        };
        return { student: studentData };
      }
    } catch (bcryptError) {
      logSecurely('studentSimpleLoginService: Password comparison error');
      return { error: 'Authentication failed. Please try again.' };
    }

    return { error: 'Invalid credentials. Please check your password and try again.' };
  } catch (error) {
    logSecurely('studentSimpleLoginService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Teacher signup with enhanced security
export const teacherSignupService = async (
  name: string,
  email: string,
  school: string,
  password: string,
  role: 'teacher' | 'admin' | 'doctor' = 'teacher',
  specialization?: string,
  license_number?: string
) => {
  try {
    logSecurely('teacherSignupService: Creating teacher account');

    // Enhanced input validation
    if (!name?.trim() || !email?.trim() || !school?.trim() || !password?.trim()) {
      return { error: 'All required fields must be filled.' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { error: 'Please enter a valid email address.' };
    }

    // Password strength validation
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.trim());

    if (checkError) {
      logSecurely('teacherSignupService: Database error during duplicate check:', checkError.message);
      if (checkError.message.includes('permission denied') || checkError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      return { error: 'Database error. Please try again.' };
    }

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'A teacher with this email already exists.' };
    }

    // Hash the password with higher cost for better security
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password_hash: passwordHash,
        role,
        specialization: specialization?.trim() || null,
        license_number: license_number?.trim() || null
      })
      .select()
      .single();

    if (insertError) {
      logSecurely('teacherSignupService: Database error during insertion:', insertError.message);
      if (insertError.message.includes('permission denied') || insertError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      return { error: 'Failed to create account. Please try again.' };
    }

    logSecurely('teacherSignupService: Teacher account created successfully');
    const teacherData: Teacher = {
      id: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      school: newTeacher.school,
      role: newTeacher.role as 'teacher' | 'admin' | 'doctor',
      specialization: newTeacher.specialization,
      license_number: newTeacher.license_number,
      is_available: newTeacher.is_available
    };

    return { teacher: teacherData };
  } catch (error) {
    logSecurely('teacherSignupService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student signup with enhanced security
export const studentSignupService = async (
  fullName: string,
  school: string,
  grade: string,
  password: string
) => {
  try {
    logSecurely('studentSignupService: Creating student account');

    // Enhanced input validation
    if (!fullName?.trim() || !school?.trim() || !grade?.trim() || !password?.trim()) {
      return { error: 'All fields are required.' };
    }

    // Password strength validation
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    // Check if student already exists
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim());

    if (checkError) {
      logSecurely('studentSignupService: Database error during duplicate check:', checkError.message);
      if (checkError.message.includes('permission denied') || checkError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      return { error: 'Database error. Please try again.' };
    }

    if (existingStudents && existingStudents.length > 0) {
      return { error: 'A student with this name already exists at this school.' };
    }

    // Hash the password with higher cost for better security
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new student
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: passwordHash
      })
      .select()
      .single();

    if (insertError) {
      logSecurely('studentSignupService: Database error during insertion:', insertError.message);
      if (insertError.message.includes('permission denied') || insertError.message.includes('RLS')) {
        return { error: 'Database access issue. Please contact system administrator.' };
      }
      return { error: 'Failed to create account. Please try again.' };
    }

    logSecurely('studentSignupService: Student account created successfully');
    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    return { student: studentData };
  } catch (error) {
    logSecurely('studentSignupService: Unexpected error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};
