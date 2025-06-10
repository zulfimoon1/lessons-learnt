
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { Teacher, Student } from '@/types/auth';

// Teacher login with simple name/password
export const teacherSimpleLoginService = async (name: string, password: string, school: string) => {
  try {
    console.log('teacherSimpleLoginService: Attempting login for:', name, 'at school:', school);

    // First, try to find teacher by name and school
    const { data: teachers, error: searchError } = await supabase
      .from('teachers')
      .select('*')
      .eq('name', name.trim())
      .eq('school', school.trim());

    if (searchError) {
      console.error('teacherSimpleLoginService: Error searching for teacher:', searchError);
      return { error: 'Database error. Please try again.' };
    }

    if (!teachers || teachers.length === 0) {
      console.log('teacherSimpleLoginService: No teacher found with name:', name);
      return { error: 'Invalid credentials. Please check your name and try again.' };
    }

    // Check password for each matching teacher
    for (const teacher of teachers) {
      const isValidPassword = await bcrypt.compare(password, teacher.password_hash);
      if (isValidPassword) {
        console.log('teacherSimpleLoginService: Password valid for teacher:', teacher.id);
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
    }

    console.log('teacherSimpleLoginService: Invalid password for teacher:', name);
    return { error: 'Invalid credentials. Please check your password and try again.' };
  } catch (error) {
    console.error('teacherSimpleLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student login with simple name/password
export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('studentSimpleLoginService: Attempting login for:', fullName);

    // Search for student by full name
    const { data: students, error: searchError } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim());

    if (searchError) {
      console.error('studentSimpleLoginService: Error searching for student:', searchError);
      return { error: 'Database error. Please try again.' };
    }

    if (!students || students.length === 0) {
      console.log('studentSimpleLoginService: No student found with name:', fullName);
      return { error: 'Invalid credentials. Please check your name and try again.' };
    }

    // Check password for the student
    const student = students[0];
    const isValidPassword = await bcrypt.compare(password, student.password_hash);
    
    if (isValidPassword) {
      console.log('studentSimpleLoginService: Password valid for student:', student.id);
      const studentData: Student = {
        id: student.id,
        full_name: student.full_name,
        school: student.school,
        grade: student.grade
      };
      return { student: studentData };
    }

    console.log('studentSimpleLoginService: Invalid password for student:', fullName);
    return { error: 'Invalid credentials. Please check your password and try again.' };
  } catch (error) {
    console.error('studentSimpleLoginService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Teacher signup
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
    console.log('teacherSignupService: Creating teacher account for:', email);

    // Check if teacher already exists
    const { data: existingTeachers, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email.trim());

    if (checkError) {
      console.error('teacherSignupService: Error checking existing teacher:', checkError);
      return { error: 'Database error. Please try again.' };
    }

    if (existingTeachers && existingTeachers.length > 0) {
      return { error: 'A teacher with this email already exists.' };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.trim(),
        school: school.trim(),
        password_hash: passwordHash,
        role,
        specialization: specialization?.trim() || null,
        license_number: license_number?.trim() || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('teacherSignupService: Error creating teacher:', insertError);
      return { error: 'Failed to create account. Please try again.' };
    }

    console.log('teacherSignupService: Teacher created successfully:', newTeacher.id);
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
    console.error('teacherSignupService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

// Student signup
export const studentSignupService = async (
  fullName: string,
  school: string,
  grade: string,
  password: string
) => {
  try {
    console.log('studentSignupService: Creating student account for:', fullName);

    // Check if student already exists
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim());

    if (checkError) {
      console.error('studentSignupService: Error checking existing student:', checkError);
      return { error: 'Database error. Please try again.' };
    }

    if (existingStudents && existingStudents.length > 0) {
      return { error: 'A student with this name already exists at this school.' };
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

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
      console.error('studentSignupService: Error creating student:', insertError);
      return { error: 'Failed to create account. Please try again.' };
    }

    console.log('studentSignupService: Student created successfully:', newStudent.id);
    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    return { student: studentData };
  } catch (error) {
    console.error('studentSignupService: Unexpected error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};
