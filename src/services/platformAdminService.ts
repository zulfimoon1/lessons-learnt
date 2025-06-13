
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword, hashPassword } from './securePasswordService';

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
    
    // Set platform admin context to bypass RLS
    console.log('🔍 Setting platform admin context...');
    await supabase.rpc('set_platform_admin_context', { admin_email: email });
    
    console.log('🔍 Querying teachers table directly...');
    const { data: adminData, error: queryError } = await supabase
      .from('teachers')
      .select('id, name, email, role, school, password_hash')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .limit(1);
    
    if (queryError) {
      console.error('❌ Query error:', queryError);
      return { error: `Query error: ${queryError.message}` };
    }
    
    if (!adminData || adminData.length === 0) {
      console.log('⚠️ No admin record found');
      return { 
        success: true, 
        message: '⚠️ No admin record found with that email' 
      };
    }
    
    const admin = adminData[0];
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      school: admin.school,
      hasHash: !!admin.password_hash,
      hashLength: admin.password_hash?.length
    });
    
    if (!admin.password_hash) {
      console.log('⚠️ No password hash found');
      return { 
        success: true, 
        message: '⚠️ Password hash needs to be set up' 
      };
    }
    
    // Test the verification
    console.log('🔍 Testing password verification...');
    const isValid = await verifyPassword(password, admin.password_hash);
    console.log('🔍 Password verification result:', isValid);
    
    console.log('🎉 === PASSWORD VERIFICATION TEST SUCCESS ===');
    return { 
      success: true, 
      message: isValid ? '🎉 Password verification successful!' : '⚠️ Password verification failed'
    };
    
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

    // Set platform admin context to bypass RLS
    console.log('🔍 Setting platform admin context...');
    await supabase.rpc('set_platform_admin_context', { admin_email: sanitizedEmail });

    // Query teachers table directly with RLS bypassed
    console.log('🔍 Querying teachers table...');
    const { data: adminData, error: queryError } = await supabase
      .from('teachers')
      .select('id, name, email, role, school, password_hash')
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .limit(1);

    if (queryError) {
      console.error('❌ Query error:', queryError);
      return { error: 'Database query failed' };
    }

    if (!adminData || adminData.length === 0) {
      console.log('❌ No admin found with email:', sanitizedEmail);
      return { error: 'Admin account not found. Please contact support.' };
    }

    const admin = adminData[0];
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      school: admin.school,
      hasPasswordHash: !!admin.password_hash
    });

    // Verify password if hash exists
    if (admin.password_hash) {
      console.log('🔐 Verifying password...');
      const isPasswordValid = await verifyPassword(password, admin.password_hash);
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed');
        return { error: 'Invalid admin credentials' };
      }
    } else {
      console.log('⚠️ No password hash found - this should not happen');
      return { error: 'Admin account setup incomplete' };
    }

    console.log('🎉 === LOGIN SUCCESSFUL ===');
    
    return { 
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        school: admin.school
      }
    };
    
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
    
    // Set admin context and update password
    await supabase.rpc('set_platform_admin_context', { admin_email: sanitizedEmail });
    
    const { error: updateError } = await supabase
      .from('teachers')
      .update({ password_hash: hashedPassword })
      .eq('email', sanitizedEmail)
      .eq('role', 'admin');
    
    if (updateError) {
      console.error('❌ Failed to update password:', updateError);
      return { error: 'Failed to reset password' };
    }
    
    console.log('✅ Password reset completed for:', sanitizedEmail);
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
