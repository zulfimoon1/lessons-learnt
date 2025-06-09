import { supabase } from '@/integrations/supabase/client';
import { Teacher, Student } from '@/types/auth';

export const teacherLoginService = async (
  email: string, 
  password: string,
  name?: string,
  school?: string,
  role?: 'teacher' | 'admin' | 'doctor',
  language: 'en' | 'lt' = 'en'
) => {
  try {
    console.log('teacherLoginService: Starting login for email:', email);
    
    if (!email.trim() || !password.trim()) {
      console.log('teacherLoginService: Missing email or password');
      return { 
        error: language === 'lt' 
          ? 'El. paštas ir slaptažodis yra privalomi' 
          : 'Email and password are required'
      };
    }

    // First check if a teacher with this email exists
    const { data: teachers, error: queryError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.trim())
      .limit(1);

    console.log('teacherLoginService: Database query result:', { teachers, queryError });

    if (queryError) {
      console.error('teacherLoginService: Database query error:', queryError);
      return { 
        error: language === 'lt' 
          ? 'Duomenų bazės klaida. Bandykite dar kartą.' 
          : 'Database error. Please try again.'
      };
    }

    // If no teacher exists with this email, create one (auto-signup)
    if (!teachers || teachers.length === 0) {
      console.log('teacherLoginService: No existing teacher found, creating new one');
      
      // Ensure we have all required data for signup
      if (!name?.trim() || !school?.trim()) {
        console.log('teacherLoginService: Missing required signup data');
        return { 
          error: language === 'lt' 
            ? 'Naujoms paskyroms reikalingas vardas ir mokykla.' 
            : 'Name and school are required for new accounts.'
        };
      }

      console.log('teacherLoginService: Creating new teacher');

      const { data: newTeacher, error: createError } = await supabase
        .from('teachers')
        .insert({
          email: email.trim(),
          password_hash: password.trim(),
          name: name.trim(),
          school: school.trim(),
          role: role || 'teacher'
        })
        .select()
        .single();

      console.log('teacherLoginService: Teacher creation result:', { newTeacher, createError });

      if (createError) {
        console.error('teacherLoginService: Error creating teacher:', createError);
        if (createError.code === '23505') {
          return { 
            error: language === 'lt' 
              ? 'Paskyra su šiuo el. paštu jau egzistuoja.' 
              : 'An account with this email already exists.'
          };
        }
        return { 
          error: language === 'lt' 
            ? 'Nepavyko sukurti paskyros. Bandykite dar kartą.' 
            : 'Failed to create account. Please try again.'
        };
      }

      if (!newTeacher) {
        console.error('teacherLoginService: No teacher data returned after creation');
        return { 
          error: language === 'lt' 
            ? 'Nepavyko sukurti paskyros. Bandykite dar kartą.' 
            : 'Failed to create account. Please try again.'
        };
      }

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

      console.log('teacherLoginService: New teacher created successfully:', teacherData);
      return { teacher: teacherData };
    }

    // Otherwise, check password and login
    const teacher = teachers[0];
    console.log('teacherLoginService: Found existing teacher:', teacher.email);
    
    if (!teacher.password_hash || teacher.password_hash !== password.trim()) {
      console.log('teacherLoginService: Password mismatch');
      return { 
        error: language === 'lt' 
          ? 'Neteisingas el. paštas arba slaptažodis' 
          : 'Invalid email or password'
      };
    }

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

    console.log('teacherLoginService: Login successful for teacher:', teacherData);
    return { teacher: teacherData };
  } catch (error) {
    console.error('teacherLoginService: Unexpected error:', error);
    return { 
      error: language === 'lt' 
        ? 'Įvyko netikėta klaida. Bandykite dar kartą.' 
        : 'An unexpected error occurred. Please try again.'
    };
  }
};

export const studentSimpleLoginService = async (fullName: string, password: string) => {
  try {
    console.log('studentSimpleLoginService: Starting login for:', fullName);
    
    if (!fullName.trim() || !password.trim()) {
      console.log('studentSimpleLoginService: Missing name or password');
      return { error: 'Vardas ir slaptažodis yra privalomi' };
    }
    
    // Find student with matching name and password
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('password_hash', password.trim())
      .limit(1);

    console.log('studentSimpleLoginService: Database result:', { studentsFound: students?.length || 0, error });

    if (error) {
      console.error('studentSimpleLoginService: Database error:', error);
      return { error: 'Duomenų bazės klaida. Bandykite dar kartą.' };
    }

    if (!students || students.length === 0) {
      console.log('studentSimpleLoginService: No student found with matching credentials');
      return { error: 'Neteisingas vardas arba slaptažodis. Patikrinkite duomenis ir bandykite dar kartą.' };
    }

    const student = students[0];
    console.log('studentSimpleLoginService: Login successful for student:', student.full_name);

    const studentData: Student = {
      id: student.id,
      full_name: student.full_name,
      school: student.school,
      grade: student.grade
    };

    return { student: studentData };
  } catch (error) {
    console.error('studentSimpleLoginService: Unexpected error:', error);
    return { error: 'Įvyko netikėta klaida prisijungiant.' };
  }
};

export const studentSignupService = async (fullName: string, school: string, grade: string, password: string) => {
  try {
    console.log('studentSignupService: Starting signup for:', fullName);
    
    if (!fullName.trim() || !school.trim() || !grade.trim() || !password.trim()) {
      console.log('studentSignupService: Missing required fields');
      return { error: 'Visi laukai yra privalomi' };
    }
    
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash: password.trim()
      })
      .select()
      .single();

    console.log('studentSignupService: Database result:', { newStudent, error });

    if (error) {
      console.error('studentSignupService: Database error:', error);
      if (error.code === '23505') {
        return { error: 'Studentas su šiuo vardu jau egzistuoja šioje mokykloje ir klasėje.' };
      }
      return { error: 'Registracija nepavyko. Bandykite dar kartą.' };
    }

    if (!newStudent) {
      console.error('studentSignupService: No student data returned after creation');
      return { error: 'Registracija nepavyko. Bandykite dar kartą.' };
    }

    const studentData: Student = {
      id: newStudent.id,
      full_name: newStudent.full_name,
      school: newStudent.school,
      grade: newStudent.grade
    };

    console.log('studentSignupService: Student signup successful:', studentData);
    return { student: studentData };
  } catch (error) {
    console.error('studentSignupService: Unexpected error:', error);
    return { error: 'Įvyko netikėta klaida registruojantis.' };
  }
};
