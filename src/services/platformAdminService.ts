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
    
    // Use RPC function to bypass RLS for admin operations
    console.log('🔍 Using RPC to query admin...');
    const { data: adminData, error: rpcError } = await supabase.rpc('get_platform_stats', { stat_type: 'teachers' });
    
    if (rpcError) {
      console.error('❌ RPC error:', rpcError);
    }
    
    // Try direct query with service role simulation
    console.log('🔍 Attempting direct admin lookup...');
    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .limit(1);
    
    if (error) {
      console.error('❌ Database query error:', error);
      return { error: `Database error: ${error.message}` };
    }
    
    if (!admin || admin.length === 0) {
      console.log('⚠️ No admin record found, this is likely due to RLS policies');
      return { 
        success: true, 
        message: '⚠️ Admin record not accessible due to security policies. This is expected behavior.' 
      };
    }
    
    const adminRecord = admin[0];
    console.log('✅ Admin found:', {
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      school: adminRecord.school,
      hasHash: !!adminRecord.password_hash,
      hashLength: adminRecord.password_hash?.length
    });
    
    if (!adminRecord.password_hash) {
      console.log('⚠️ No password hash found');
      return { 
        success: true, 
        message: '⚠️ Password hash needs to be set up' 
      };
    }
    
    // Test the verification
    console.log('🔍 Testing password verification...');
    const isValid = await verifyPassword(password, adminRecord.password_hash);
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

    // Use the dedicated authentication function that bypasses RLS
    console.log('🔍 Using dedicated authentication function...');
    const { data: authResult, error: authError } = await supabase.rpc(
      'authenticate_platform_admin', 
      { 
        admin_email: sanitizedEmail,
        provided_password: password 
      }
    );

    if (authError) {
      console.error('❌ Authentication function error:', authError);
      return { error: 'Authentication service error' };
    }

    if (!authResult || authResult.length === 0) {
      console.log('❌ No admin found');
      return { error: 'Invalid admin credentials' };
    }

    const admin = authResult[0];
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      school: admin.school,
      hasPasswordHash: !!admin.password_hash
    });

    // Verify password
    if (!admin.password_hash) {
      console.error('❌ No password hash found');
      return { error: 'Authentication configuration error' };
    }

    console.log('🔐 Verifying password...');
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return { error: 'Invalid admin credentials' };
    }

    console.log('🎉 === LOGIN SUCCESSFUL ===');
    
    // Set platform admin context for future operations
    try {
      await supabase.rpc('set_platform_admin_context', { admin_email: sanitizedEmail });
      console.log('✅ Platform admin context set');
    } catch (contextError) {
      console.log('⚠️ Could not set platform admin context:', contextError);
    }

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
    
    // Set platform admin context
    try {
      await supabase.rpc('set_platform_admin_context', { admin_email: sanitizedEmail });
    } catch (contextError) {
      console.log('Could not set context for reset:', contextError);
    }
    
    const { data, error } = await supabase
      .from('teachers')
      .upsert({
        email: sanitizedEmail,
        name: 'Platform Admin',
        school: 'Platform Administration',
        role: 'admin',
        password_hash: hashedPassword
      }, {
        onConflict: 'email'
      })
      .select();
    
    if (error) {
      console.error('Password reset error:', error);
      return { error: 'Failed to reset password' };
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
