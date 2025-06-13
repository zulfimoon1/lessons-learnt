
import { supabase } from '@/integrations/supabase/client';

const DEMO_ACCOUNTS = {
  teachers: [
    { email: 'demoadmin@demo.com', password: 'demo123', role: 'admin' },
    { email: 'demoteacher@demo.com', password: 'demo123', role: 'teacher' },
    { email: 'demodoc@demo.com', password: 'demo123', role: 'doctor' }
  ],
  students: [
    { full_name: 'Demo Student', password: 'demo123', school: 'Demo School', grade: 'Grade 5' }
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
  console.log('Email:', email);
  
  // Check if it's a demo account
  const demoTeacher = DEMO_ACCOUNTS.teachers.find(t => t.email === email);
  if (!demoTeacher) {
    console.log('Not a demo account');
    return null;
  }
  
  // For demo accounts, just check password directly
  if (password !== 'demo123') {
    console.log('Wrong demo password');
    return null;
  }
  
  // Get teacher from database
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !teacher) {
    console.log('Demo teacher not found in database, creating fallback');
    // Return fallback data for demo
    return {
      id: `demo-${demoTeacher.role}-id`,
      name: demoTeacher.role === 'admin' ? 'Demo Administrator' : 
            demoTeacher.role === 'doctor' ? 'Demo Doctor' : 'Demo Teacher',
      email: demoTeacher.email,
      school: 'Demo School',
      role: demoTeacher.role,
      specialization: demoTeacher.role === 'doctor' ? 'School Psychology' : null,
      license_number: demoTeacher.role === 'doctor' ? 'PSY-DEMO-123' : null,
      is_available: true
    };
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
  console.log('Full name:', fullName);
  
  // Check if it's a demo account
  const demoStudent = DEMO_ACCOUNTS.students.find(s => s.full_name === fullName);
  if (!demoStudent) {
    console.log('Not a demo account');
    return null;
  }
  
  // For demo accounts, just check password directly
  if (password !== 'demo123') {
    console.log('Wrong demo password');
    return null;
  }
  
  // Get student from database
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('full_name', fullName.trim())
    .single();

  if (error || !student) {
    console.log('Demo student not found in database, creating fallback');
    // Return fallback data for demo
    return {
      id: 'demo-student-id',
      full_name: 'Demo Student',
      school: 'Demo School',
      grade: 'Grade 5'
    };
  }

  console.log('God mode demo student login successful');
  return {
    id: student.id,
    full_name: student.full_name,
    school: student.school,
    grade: student.grade
  };
};

// Test function to verify all demo accounts
export const testAllDemoAccounts = async () => {
  console.log('=== TESTING ALL DEMO ACCOUNTS ===');
  
  const results = {
    teachers: {},
    students: {}
  };
  
  // Test teacher accounts
  for (const teacher of DEMO_ACCOUNTS.teachers) {
    console.log(`Testing teacher: ${teacher.email}`);
    const result = await godModeTeacherLogin(teacher.email, teacher.password);
    results.teachers[teacher.email] = result !== null;
    console.log(`${teacher.email} login:`, result ? 'SUCCESS' : 'FAILED');
  }
  
  // Test student accounts
  for (const student of DEMO_ACCOUNTS.students) {
    console.log(`Testing student: ${student.full_name}`);
    const result = await godModeStudentLogin(student.full_name, student.password);
    results.students[student.full_name] = result !== null;
    console.log(`${student.full_name} login:`, result ? 'SUCCESS' : 'FAILED');
  }
  
  console.log('=== TEST RESULTS ===', results);
  return results;
};
