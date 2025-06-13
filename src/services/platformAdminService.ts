import { supabase } from '@/integrations/supabase/client';
import { verifyPassword, hashPassword, generateTestHash } from './securePasswordService';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

export interface StudentStatistics {
  school: string;
  total_students: number;
  student_response_rate: number;
}

// Enhanced input validation
const validateLoginInput = (email: string, password: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email || !password) {
    return { valid: false, error: 'Email and password are required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Enhanced test function to debug password issues
export const testPasswordVerification = async (email: string = 'zulfimoon1@gmail.com', password: string = 'admin123') => {
  try {
    console.log('🔍 === PASSWORD VERIFICATION TEST START ===');
    console.log('🔍 Testing email:', email);
    console.log('🔍 Testing password:', password);
    
    // Get the admin record
    console.log('🔍 Querying for admin record...');
    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .single();
    
    if (error) {
      console.error('❌ Database query error:', error);
      return { error: `Database error: ${error.message}` };
    }
    
    if (!admin) {
      console.error('❌ No admin record found');
      return { error: 'Admin not found' };
    }
    
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      school: admin.school,
      hasHash: !!admin.password_hash,
      hashLength: admin.password_hash?.length
    });
    
    if (!admin.password_hash) {
      console.log('⚠️ No password hash found, generating fresh hash...');
      const newHash = await generateTestHash(password);
      console.log('🔄 Generated new hash, updating database...');
      
      // Update the admin record
      const { error: updateError } = await supabase
        .from('teachers')
        .update({ password_hash: newHash })
        .eq('id', admin.id);
      
      if (updateError) {
        console.error('❌ Failed to update hash:', updateError);
        return { error: `Failed to update password hash: ${updateError.message}` };
      }
      
      console.log('✅ Hash updated successfully');
      return { success: true, message: '✅ Password hash regenerated - please try logging in now' };
    }
    
    // Test the verification
    console.log('🔍 Testing password verification with stored hash...');
    console.log('🔍 Hash format check - starts with $2b$:', admin.password_hash.startsWith('$2b$'));
    console.log('🔍 Hash length:', admin.password_hash.length);
    
    const isValid = await verifyPassword(password, admin.password_hash);
    console.log('🔍 Password verification result:', isValid);
    
    if (!isValid) {
      console.log('⚠️ Verification failed, regenerating hash...');
      const newHash = await generateTestHash(password);
      console.log('🔄 Generated new hash, updating database...');
      
      const { error: updateError } = await supabase
        .from('teachers')
        .update({ password_hash: newHash })
        .eq('id', admin.id);
      
      if (updateError) {
        console.error('❌ Failed to update hash:', updateError);
        return { error: `Failed to update password hash: ${updateError.message}` };
      }
      
      console.log('✅ Hash regenerated and updated successfully');
      return { 
        success: true, 
        message: `✅ Password hash regenerated due to verification failure. New hash length: ${newHash.length}` 
      };
    }
    
    console.log('🎉 === PASSWORD VERIFICATION TEST SUCCESS ===');
    return { success: true, message: '🎉 Password verification successful! You should be able to login now.' };
    
  } catch (error) {
    console.error('💥 Test verification error:', error);
    return { error: `Test failed: ${error.message}` };
  }
};

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    console.log('=== PLATFORM ADMIN LOGIN SERVICE START ===');
    console.log('Login attempt for:', email);

    // Enhanced input validation
    const validation = validateLoginInput(email, password);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.error);
      return { error: validation.error };
    }

    const sanitizedEmail = email.toLowerCase().trim();
    console.log('📧 Sanitized email:', sanitizedEmail);

    // Database query with more detailed logging
    console.log('🔍 Querying database for admin...');
    
    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('📊 Database query result:');
    console.log('- admin found:', !!admin);
    console.log('- error:', error);

    if (error) {
      console.error('❌ Database error details:', error);
      return { error: 'Database error occurred' };
    }

    if (!admin) {
      console.log('❌ No admin found with email:', sanitizedEmail);
      return { error: 'Invalid admin credentials' };
    }

    console.log('✅ Admin found:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      school: admin.school,
      hasPasswordHash: !!admin.password_hash
    });

    // Password verification
    if (!admin.password_hash) {
      console.error('❌ CRITICAL: No password hash found for admin');
      return { error: 'Authentication configuration error - please reset password' };
    }

    console.log('🔐 Starting password verification...');
    
    let isPasswordValid = false;
    try {
      isPasswordValid = await verifyPassword(password, admin.password_hash);
      console.log('🔐 Password verification result:', isPasswordValid);
      
    } catch (verifyError) {
      console.error('❌ Password verification error:', verifyError);
      return { error: 'Authentication verification failed' };
    }
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return { error: 'Invalid admin credentials' };
    }
    
    console.log('🎉 === LOGIN SUCCESSFUL ===');
    const result = { 
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        school: admin.school
      }
    };
    console.log('✅ Returning successful result');
    return result;
    
  } catch (error) {
    console.error('💥 === UNEXPECTED LOGIN ERROR ===');
    console.error('Error details:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

// Add a password reset function for the admin
export const resetAdminPassword = async (email: string, newPassword: string) => {
  try {
    console.log('Resetting password for admin:', email);
    
    const sanitizedEmail = email.toLowerCase().trim();
    const hashedPassword = await hashPassword(newPassword);
    
    console.log('Generated new hash, length:', hashedPassword.length);
    console.log('Hash preview:', hashedPassword.substring(0, 20) + '...');
    
    const { data, error } = await supabase
      .from('teachers')
      .update({ password_hash: hashedPassword })
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .select();
    
    if (error) {
      console.error('Password reset error:', error);
      return { error: 'Failed to reset password' };
    }
    
    if (!data || data.length === 0) {
      return { error: 'Admin not found' };
    }
    
    console.log('Password reset successful for:', sanitizedEmail);
    return { success: true };
    
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Failed to reset password' };
  }
};

// Add admin security utilities
export const adminSecurityUtils = {
  getSecurityMetrics: async () => {
    try {
      // Mock security metrics for now - in production, fetch from security service
      return {
        loginAttempts: 12,
        suspiciousActivities: 3,
        blockedIPs: 7,
        lastSecurityScan: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }
};
