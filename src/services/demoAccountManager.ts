
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from './securePasswordService';

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

// Use the correct bcrypt hash for demo123
const DEMO_HASH = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu';

export const ensureDemoAccountHash = async (email?: string, fullName?: string, password?: string) => {
  console.log('=== ENSURING DEMO ACCOUNT HASH ===');
  
  if (!password || password !== 'demo123') {
    return { isDemo: false };
  }

  try {
    // Handle teacher demo accounts
    if (email && email.includes('demo')) {
      console.log(`Ensuring hash for demo teacher: ${email}`);
      
      const { error } = await supabase
        .from('teachers')
        .update({ password_hash: DEMO_HASH })
        .eq('email', email);
      
      if (error) {
        console.error(`Error updating demo teacher ${email}:`, error);
        return { isDemo: true, success: false, error };
      }
      
      console.log(`Successfully updated hash for demo teacher: ${email}`);
      return { isDemo: true, success: true };
    }

    // Handle student demo accounts
    if (fullName && fullName.includes('Demo')) {
      console.log(`Ensuring hash for demo student: ${fullName}`);
      
      const { error } = await supabase
        .from('students')
        .update({ password_hash: DEMO_HASH })
        .eq('full_name', fullName);
      
      if (error) {
        console.error(`Error updating demo student ${fullName}:`, error);
        return { isDemo: true, success: false, error };
      }
      
      console.log(`Successfully updated hash for demo student: ${fullName}`);
      return { isDemo: true, success: true };
    }

    return { isDemo: false };
    
  } catch (error) {
    console.error('Error ensuring demo account hash:', error);
    return { isDemo: true, success: false, error };
  }
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
