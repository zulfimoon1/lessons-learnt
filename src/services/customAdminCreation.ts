
import { supabase } from '@/integrations/supabase/client';
import { hashPassword } from './securePasswordService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface CreateCustomAdminParams {
  name: string;
  email: string;
  school: string;
  password: string;
}

export const createCustomAdmin = async (params: CreateCustomAdminParams) => {
  try {
    // Validate input
    if (!params.name || !params.email || !params.school || !params.password) {
      return { error: 'All fields are required' };
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', params.email.toLowerCase().trim())
      .single();

    if (existingAdmin) {
      return { error: 'An admin with this email already exists' };
    }

    // Hash the password securely
    const hashedPassword = await hashPassword(params.password);
    
    // Create the admin account
    const { data: admin, error } = await supabase
      .from('teachers')
      .insert([{
        name: params.name.trim(),
        email: params.email.toLowerCase().trim(),
        school: params.school.trim(),
        role: 'admin',
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Custom admin creation error:', error);
      return { error: 'Failed to create admin account' };
    }

    // Log the creation
    logUserSecurityEvent({
      type: 'test_admin_created',
      userId: admin.id,
      timestamp: new Date().toISOString(),
      details: `Custom admin account created: ${params.email}`,
      userAgent: navigator.userAgent
    });

    return { success: true, admin };
  } catch (error) {
    console.error('Create custom admin error:', error);
    return { error: 'Failed to create admin account' };
  }
};

// Function to remove placeholder admin if it exists
export const removePlaceholderAdmin = async () => {
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('email', 'your-email@domain.com');

    if (error) {
      console.error('Error removing placeholder admin:', error);
      return { error: 'Failed to remove placeholder admin' };
    }

    return { success: true };
  } catch (error) {
    console.error('Remove placeholder admin error:', error);
    return { error: 'Failed to remove placeholder admin' };
  }
};
