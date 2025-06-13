
import { supabase } from '@/integrations/supabase/client';

const DEMO_ACCOUNTS = {
  teachers: [
    { email: 'demoadmin@demo.com', password: 'demo123', role: 'admin' },
    { email: 'demoteacher@demo.com', password: 'demo123', role: 'teacher' },
    { email: 'demodoc@demo.com', password: 'demo123', role: 'doctor' }
  ],
  students: [
    { full_name: 'Demo Student', password: 'demo123' }
  ]
};

export const isDemoAccount = (email?: string, fullName?: string) => {
  if (email && DEMO_ACCOUNTS.teachers.some(teacher => teacher.email === email)) {
    return true;
  }
  if (fullName && DEMO_ACCOUNTS.students.some(student => student.full_name === fullName)) {
    return true;
  }
  return false;
};

// God mode: Direct demo login without bcrypt verification
export const godModeTeacherLogin = async (email: string, password: string) => {
  console.log('=== GOD MODE TEACHER LOGIN ===');
  
  // Check if it's a demo account
  const demoTeacher = DEMO_ACCOUNTS.teachers.find(t => t.email === email);
  if (!demoTeacher) {
    return null;
  }
  
  // For demo accounts, just check password directly
  if (password !== 'demo123') {
    return null;
  }
  
  // Get teacher from database
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !teacher) {
    console.log('Demo teacher not found in database');
    return null;
  }

  console.log('God mode demo teacher login successful');
  return {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    school: teacher.school,
    role: teacher.role,
    specialization: teacher.specialization,
    license_number: teacher.license_number,
    is_available: teacher.is_available
  };
};

export const godModeStudentLogin = async (fullName: string, password: string) => {
  console.log('=== GOD MODE STUDENT LOGIN ===');
  
  // Check if it's a demo account
  const demoStudent = DEMO_ACCOUNTS.students.find(s => s.full_name === fullName);
  if (!demoStudent) {
    return null;
  }
  
  // For demo accounts, just check password directly
  if (password !== 'demo123') {
    return null;
  }
  
  // Get student from database
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('full_name', fullName.trim())
    .single();

  if (error || !student) {
    console.log('Demo student not found in database');
    return null;
  }

  console.log('God mode demo student login successful');
  return {
    id: student.id,
    full_name: student.full_name,
    school: student.school,
    grade: student.grade
  };
};
