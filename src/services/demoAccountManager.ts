
import { supabase } from '@/integrations/supabase/client';
import { generateDemoHash, testDemoHash, WORKING_DEMO_HASH } from './demoHashGenerator';

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

// Function to fix demo account hashes
export const fixDemoAccountHashes = async () => {
  try {
    console.log('=== FIXING DEMO ACCOUNT HASHES ===');
    
    // Generate a fresh hash for demo123
    let workingHash: string;
    try {
      workingHash = await generateDemoHash();
    } catch (error) {
      console.log('Using backup hash');
      workingHash = WORKING_DEMO_HASH;
    }
    
    // Test the hash before using it
    const hashWorks = await testDemoHash(workingHash);
    if (!hashWorks) {
      throw new Error('Hash verification failed');
    }
    
    console.log('Using verified hash:', workingHash);
    
    // Update all demo teacher accounts
    const { error: teacherError } = await supabase
      .from('teachers')
      .update({ password_hash: workingHash })
      .in('email', ['demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com']);
    
    if (teacherError) {
      console.error('Error updating teacher hashes:', teacherError);
      throw teacherError;
    }
    
    // Update demo student account
    const { error: studentError } = await supabase
      .from('students')
      .update({ password_hash: workingHash })
      .eq('full_name', 'Demo Student');
    
    if (studentError) {
      console.error('Error updating student hash:', studentError);
      throw studentError;
    }
    
    console.log('Demo account hashes updated successfully');
    return { success: true, hash: workingHash };
    
  } catch (error) {
    console.error('Failed to fix demo account hashes:', error);
    return { success: false, error };
  }
};

// Auto-fix demo accounts on import
fixDemoAccountHashes().then(result => {
  if (result.success) {
    console.log('Demo accounts are ready for login with password: demo123');
  } else {
    console.error('Demo account setup failed:', result.error);
  }
});
