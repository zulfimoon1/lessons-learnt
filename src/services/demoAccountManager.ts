
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

export const ensureDemoAccountHash = async (email?: string, fullName?: string, password?: string) => {
  console.log('=== ENSURING DEMO ACCOUNT HASH ===');
  
  if (!password || password !== 'demo123') {
    return { isDemo: false };
  }

  try {
    // First test if bcrypt environment is working
    console.log('Testing bcrypt environment...');
    const bcryptWorking = await testBcryptEnvironment();
    if (!bcryptWorking) {
      console.error('Bcrypt environment test failed!');
      return { isDemo: true, success: false, error: 'Bcrypt environment not working' };
    }
    console.log('Bcrypt environment test passed!');

    console.log('Creating fresh demo hash...');
    const freshHash = await createDemoHash();
    console.log('Fresh demo hash created:', freshHash);

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

// Function to initialize all demo account passwords immediately
export const initializeDemoPasswords = async () => {
  try {
    console.log('=== INITIALIZING ALL DEMO PASSWORDS ===');
    
    const freshHash = await createDemoHash();
    console.log('Created fresh hash for all demo accounts:', freshHash);
    
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
    
    console.log('All demo account passwords initialized successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Error initializing demo passwords:', error);
    return { success: false, error };
  }
};

// Function to reset all demo account passwords
export const resetAllDemoPasswords = async () => {
  return await initializeDemoPasswords();
};
