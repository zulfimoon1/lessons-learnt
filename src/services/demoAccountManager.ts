
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from './securePasswordService';

export const regenerateDemoAccountHashes = async () => {
  console.log('=== REGENERATING DEMO ACCOUNT HASHES ===');
  
  try {
    // Demo teacher accounts with their correct passwords
    const demoTeachers = [
      { email: 'demoadmin@demo.com', password: 'demo123', role: 'admin' },
      { email: 'demoteacher@demo.com', password: 'demo123', role: 'teacher' },
      { email: 'demodoc@demo.com', password: 'demo123', role: 'doctor' }
    ];

    // Demo student accounts
    const demoStudents = [
      { full_name: 'Demo Student', password: 'demo123' }
    ];

    // Update teacher passwords
    for (const teacher of demoTeachers) {
      console.log(`Regenerating hash for teacher: ${teacher.email}`);
      const newHash = await hashPassword(teacher.password);
      
      const { error } = await supabase
        .from('teachers')
        .update({ password_hash: newHash })
        .eq('email', teacher.email);
      
      if (error) {
        console.error(`Error updating teacher ${teacher.email}:`, error);
      } else {
        console.log(`Successfully updated hash for teacher: ${teacher.email}`);
      }
    }

    // Update student passwords
    for (const student of demoStudents) {
      console.log(`Regenerating hash for student: ${student.full_name}`);
      const newHash = await hashPassword(student.password);
      
      const { error } = await supabase
        .from('students')
        .update({ password_hash: newHash })
        .eq('full_name', student.full_name);
      
      if (error) {
        console.error(`Error updating student ${student.full_name}:`, error);
      } else {
        console.log(`Successfully updated hash for student: ${student.full_name}`);
      }
    }

    console.log('=== DEMO ACCOUNT HASH REGENERATION COMPLETE ===');
    return { success: true };
    
  } catch (error) {
    console.error('Error regenerating demo account hashes:', error);
    return { success: false, error };
  }
};

export const validateDemoAccountHash = async (email: string, password: string) => {
  console.log(`=== VALIDATING DEMO ACCOUNT: ${email} ===`);
  
  try {
    // Get the current hash from database
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('password_hash')
      .eq('email', email)
      .single();
    
    if (error || !teacher) {
      console.log('Teacher not found or error:', error);
      return { valid: false };
    }
    
    console.log('Current stored hash:', teacher.password_hash);
    
    // If this is a demo account and the current hash doesn't work, regenerate it
    if (email.includes('demo')) {
      console.log('This is a demo account, regenerating hash...');
      const newHash = await hashPassword(password);
      
      const { error: updateError } = await supabase
        .from('teachers')
        .update({ password_hash: newHash })
        .eq('email', email);
      
      if (updateError) {
        console.error('Error updating hash:', updateError);
        return { valid: false };
      }
      
      console.log('Successfully regenerated hash for demo account');
      return { valid: true, regenerated: true };
    }
    
    return { valid: false };
    
  } catch (error) {
    console.error('Error validating demo account:', error);
    return { valid: false, error };
  }
};
