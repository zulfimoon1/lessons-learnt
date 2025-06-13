
import { supabase } from '@/integrations/supabase/client';
import { createDemoHash, verifyPassword, testBcryptEnvironment } from './securePasswordService';

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

// Function to force update all demo account passwords immediately
export const forceUpdateDemoPasswords = async () => {
  try {
    console.log('=== FORCE UPDATING ALL DEMO PASSWORDS ===');
    
    // Test bcrypt environment first
    const bcryptWorking = await testBcryptEnvironment();
    if (!bcryptWorking) {
      console.error('Bcrypt environment test failed!');
      return { success: false, error: 'Bcrypt environment not working' };
    }
    
    const freshHash = await createDemoHash();
    console.log('Created fresh hash for all demo accounts:', freshHash);
    console.log('Fresh hash length:', freshHash.length);
    
    // Update all demo teachers
    const { error: teacherError } = await supabase
      .from('teachers')
      .update({ password_hash: freshHash })
      .in('email', ['demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com']);
    
    if (teacherError) {
      console.error('Error updating demo teachers:', teacherError);
      return { success: false, error: teacherError };
    }
    
    // Update all demo students
    const { error: studentError } = await supabase
      .from('students')
      .update({ password_hash: freshHash })
      .eq('full_name', 'Demo Student');
    
    if (studentError) {
      console.error('Error updating demo students:', studentError);
      return { success: false, error: studentError };
    }
    
    console.log('All demo account passwords force updated successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Error force updating demo passwords:', error);
    return { success: false, error };
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

// Function to check if demo accounts need password updates
const checkDemoAccountHashes = async () => {
  try {
    console.log('=== CHECKING DEMO ACCOUNT HASHES ===');
    
    // Check demo teachers
    const { data: teachers } = await supabase
      .from('teachers')
      .select('email, password_hash')
      .in('email', ['demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com']);
    
    // Check demo students
    const { data: students } = await supabase
      .from('students')
      .select('full_name, password_hash')
      .eq('full_name', 'Demo Student');
    
    const allAccounts = [...(teachers || []), ...(students || [])];
    const needsUpdate = allAccounts.some(account => 
      !account.password_hash || 
      account.password_hash.includes('TEMP_HASH_TO_BE_REPLACED') ||
      account.password_hash.length !== 60
    );
    
    console.log('Demo accounts need update:', needsUpdate);
    return needsUpdate;
    
  } catch (error) {
    console.error('Error checking demo account hashes:', error);
    return true; // Assume needs update on error
  }
};

// Function to initialize all demo account passwords immediately on app start
export const initializeDemoPasswordsOnStartup = async () => {
  try {
    console.log('=== INITIALIZING DEMO PASSWORDS ON STARTUP ===');
    
    const needsUpdate = await checkDemoAccountHashes();
    
    if (needsUpdate) {
      console.log('Demo accounts need password update, updating now...');
      return await forceUpdateDemoPasswords();
    } else {
      console.log('Demo accounts already have proper hashes');
      return { success: true };
    }
    
  } catch (error) {
    console.error('Error initializing demo passwords:', error);
    return { success: false, error };
  }
};

export const ensureDemoAccountHash = async (email?: string, fullName?: string, password?: string) => {
  console.log('=== ENSURING DEMO ACCOUNT HASH ===');
  
  if (!password || password !== 'demo123') {
    return { isDemo: false };
  }

  // Always force update for demo accounts to ensure fresh hashes
  if (isDemoAccount(email, fullName)) {
    console.log('Demo account detected, force updating all demo passwords...');
    const result = await forceUpdateDemoPasswords();
    return { isDemo: true, ...result };
  }

  return { isDemo: false };
};
