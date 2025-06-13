
import { supabase } from '@/integrations/supabase/client';
import { createDemoHash } from './securePasswordService';

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

// Function to ensure demo accounts have proper password hashes
export const ensureDemoAccountHashes = async () => {
  try {
    console.log('=== ENSURING DEMO ACCOUNT HASHES ===');
    
    // Generate a fresh hash for demo123
    const demoHash = await createDemoHash();
    console.log('Created fresh demo hash:', demoHash);
    
    // Update teacher demo accounts
    for (const teacher of DEMO_ACCOUNTS.teachers) {
      console.log(`Updating hash for teacher: ${teacher.email}`);
      const { error } = await supabase
        .from('teachers')
        .update({ password_hash: demoHash })
        .eq('email', teacher.email);
      
      if (error) {
        console.error(`Failed to update teacher ${teacher.email}:`, error);
      } else {
        console.log(`Successfully updated teacher ${teacher.email}`);
      }
    }
    
    // Update student demo accounts
    for (const student of DEMO_ACCOUNTS.students) {
      console.log(`Updating hash for student: ${student.full_name}`);
      const { error } = await supabase
        .from('students')
        .update({ password_hash: demoHash })
        .eq('full_name', student.full_name);
      
      if (error) {
        console.error(`Failed to update student ${student.full_name}:`, error);
      } else {
        console.log(`Successfully updated student ${student.full_name}`);
      }
    }
    
    console.log('Demo account hash update complete');
    return true;
  } catch (error) {
    console.error('Failed to ensure demo account hashes:', error);
    return false;
  }
};
