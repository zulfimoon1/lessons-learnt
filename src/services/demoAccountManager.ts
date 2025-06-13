
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from './securePasswordService';

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

export const ensureDemoAccountHash = async (email?: string, fullName?: string, password?: string) => {
  console.log('=== ENSURING DEMO ACCOUNT HASH ===');
  
  if (!password || password !== 'demo123') {
    return { isDemo: false };
  }

  try {
    console.log('Generating fresh hash for demo123...');
    const freshHash = await hashPassword('demo123');
    console.log('Generated fresh hash:', freshHash);
    
    // Verify the hash works before storing it
    const testVerification = await verifyPassword('demo123', freshHash);
    console.log('Test verification of fresh hash:', testVerification);
    
    if (!testVerification) {
      console.error('Fresh hash verification failed!');
      return { isDemo: true, success: false, error: 'Hash generation failed' };
    }

    // Handle teacher demo accounts
    if (email && email.includes('demo')) {
      console.log(`Updating hash for demo teacher: ${email}`);
      
      const { error } = await supabase
        .from('teachers')
        .update({ password_hash: freshHash })
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
      console.log(`Updating hash for demo student: ${fullName}`);
      
      const { error } = await supabase
        .from('students')
        .update({ password_hash: freshHash })
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
