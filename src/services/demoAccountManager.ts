
import { supabase } from '@/integrations/supabase/client';

const DEMO_ACCOUNTS = {
  teachers: [
    { email: 'demoadmin@demo.com', password: 'demo123', role: 'admin' },
    { email: 'demoteacher@demo.com', password: 'demo123', role: 'teacher' },
    { email: 'demodoc@demo.com', password: 'demo123', role: 'doctor' }
  ],
  students: [
    { full_name: 'demo student', password: 'demo123', school: 'demo school', grade: 'j5' }
  ]
};

export const isDemoAccount = (email?: string, fullName?: string) => {
  console.log('=== CHECKING DEMO ACCOUNT ===');
  console.log('Email:', email, 'Full name:', fullName);
  
  if (email && DEMO_ACCOUNTS.teachers.some(teacher => teacher.email.toLowerCase() === email.toLowerCase())) {
    console.log('✅ DEMO TEACHER DETECTED:', email);
    return true;
  }
  if (fullName && DEMO_ACCOUNTS.students.some(student => student.full_name.toLowerCase() === fullName.toLowerCase())) {
    console.log('✅ DEMO STUDENT DETECTED:', fullName);
    return true;
  }
  
  console.log('❌ NOT A DEMO ACCOUNT');
  return false;
};

// Check if a teacher is a demo teacher by email
export const isDemoTeacher = (email?: string) => {
  const result = email && DEMO_ACCOUNTS.teachers.some(teacher => teacher.email.toLowerCase() === (email || '').toLowerCase());
  console.log('isDemoTeacher check:', email, '→', result);
  return result;
};

// Check if a student is a demo student by name
export const isDemoStudent = (fullName?: string) => {
  const result = fullName && DEMO_ACCOUNTS.students.some(student => student.full_name.toLowerCase() === (fullName || '').toLowerCase());
  console.log('isDemoStudent check:', fullName, '→', result);
  return result;
};

// Create a fake subscription for demo accounts - ALWAYS ACTIVE
export const getDemoSubscription = (school?: string) => {
  console.log('🎯 CREATING DEMO SUBSCRIPTION - ALWAYS ACTIVE');
  return {
    id: 'demo-subscription-id',
    school_name: school || 'demo school',
    status: 'active',
    plan_type: 'premium',
    amount: 999,
    current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
  };
};

// Enhanced demo access checker - ALWAYS returns true for demo accounts
export const hasDemoAccess = (userEmail?: string, userFullName?: string, userSchool?: string) => {
  console.log('🔍 CHECKING DEMO ACCESS');
  console.log('Email:', userEmail, 'Name:', userFullName, 'School:', userSchool);
  
  const hasAccess = isDemoAccount(userEmail, userFullName);
  console.log('🎯 DEMO ACCESS RESULT:', hasAccess ? '✅ FULL ACCESS' : '❌ NO ACCESS');
  return hasAccess;
};

// UNIVERSAL DEMO CHECK - Use this everywhere to check if account should have full access
export const isUniversalDemoAccount = (teacher?: any, student?: any) => {
  console.log('🌍 UNIVERSAL DEMO CHECK');
  console.log('Teacher:', teacher?.email, 'Student:', student?.full_name);
  
  if (teacher?.email && isDemoTeacher(teacher.email)) {
    console.log('✅ DEMO TEACHER - FULL ACCESS GRANTED');
    return true;
  }
  
  if (student?.full_name && isDemoStudent(student.full_name)) {
    console.log('✅ DEMO STUDENT - FULL ACCESS GRANTED');
    return true;
  }
  
  console.log('❌ NOT A DEMO ACCOUNT - NORMAL RESTRICTIONS APPLY');
  return false;
};

// God mode: Direct demo login without any verification - just works
export const godModeTeacherLogin = async (email: string, password: string) => {
  console.log('=== GOD MODE TEACHER LOGIN ===');
  console.log('Email:', email);
  
  // Check if it's a demo account
  const demoTeacher = DEMO_ACCOUNTS.teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
  if (!demoTeacher) {
    console.log('Not a demo account');
    return null;
  }
  
  console.log('🎯 GOD MODE DEMO TEACHER LOGIN SUCCESSFUL - ALWAYS WORKS!');
  return {
    id: `demo-${demoTeacher.role}-id`,
    name: demoTeacher.role === 'admin' ? 'Demo Administrator' : 
          demoTeacher.role === 'doctor' ? 'Demo Doctor' : 'Demo Teacher',
    email: demoTeacher.email,
    school: 'demo school',
    role: demoTeacher.role,
    specialization: demoTeacher.role === 'doctor' ? 'School Psychology' : null,
    license_number: demoTeacher.role === 'doctor' ? 'PSY-DEMO-123' : null,
    is_available: true
  };
};

export const godModeStudentLogin = async (fullName: string, password: string) => {
  console.log('=== GOD MODE STUDENT LOGIN ===');
  console.log('Full name:', fullName);
  
  // Check if it's a demo account
  const demoStudent = DEMO_ACCOUNTS.students.find(s => s.full_name.toLowerCase() === fullName.toLowerCase());
  if (!demoStudent) {
    console.log('Not a demo account');
    return null;
  }
  
  console.log('🎯 GOD MODE DEMO STUDENT LOGIN SUCCESSFUL - ALWAYS WORKS!');
  return {
    id: 'demo-student-id',
    full_name: 'demo student',
    school: 'demo school',
    grade: 'j5'
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
