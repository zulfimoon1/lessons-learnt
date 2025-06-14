
import { supabase } from '@/integrations/supabase/client';

export interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  description: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  school_name: string | null;
}

export interface CreateDiscountCodeData {
  code: string;
  discount_percent: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
  school_name?: string;
}

export interface UpdateDiscountCodeData {
  code?: string;
  discount_percent?: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
  school_name?: string;
}

// Helper function to set admin context
const setAdminContext = async (adminEmail: string) => {
  console.log('🔧 Setting admin context for discount operations:', adminEmail);
  const { error } = await supabase.rpc('set_platform_admin_context', { 
    admin_email: adminEmail 
  });
  
  if (error) {
    console.error('❌ Error setting admin context:', error);
    throw new Error('Failed to set admin context');
  }
  
  console.log('✅ Admin context set successfully');
};

// Test function to verify admin access
const testAdminAccess = async () => {
  console.log('🧪 Testing admin access...');
  const { data, error } = await supabase.rpc('check_platform_admin_for_discount_codes');
  
  if (error) {
    console.error('❌ Error testing admin access:', error);
    return false;
  }
  
  console.log('✅ Admin access test result:', data);
  return data;
};

export const discountCodeService = {
  async getAllDiscountCodes(adminEmail?: string) {
    console.log('=== FETCHING DISCOUNT CODES ===');
    
    try {
      // Set admin context if provided
      if (adminEmail) {
        await setAdminContext(adminEmail);
        
        // Test admin access
        const hasAccess = await testAdminAccess();
        if (!hasAccess) {
          throw new Error('Admin access verification failed');
        }
      }
      
      console.log('Fetching discount codes...');

      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching discount codes:', error);
        throw error;
      }

      console.log('Discount codes loaded:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getAllDiscountCodes:', error);
      throw error;
    }
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string, adminEmail?: string) {
    console.log('=== CREATING DISCOUNT CODE ===');
    console.log('Code data:', codeData);
    console.log('Created by:', createdBy);
    console.log('Admin email:', adminEmail);

    try {
      // Set admin context if provided
      if (adminEmail) {
        await setAdminContext(adminEmail);
        
        // Test admin access
        const hasAccess = await testAdminAccess();
        if (!hasAccess) {
          throw new Error('Admin access verification failed');
        }
      }

      const { data, error } = await supabase
        .from('discount_codes')
        .insert([{
          ...codeData,
          created_by: createdBy,
          current_uses: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating discount code:', error);
        throw error;
      }

      console.log('Discount code created:', data);
      return data;
    } catch (error) {
      console.error('Error in createDiscountCode:', error);
      throw error;
    }
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData, adminEmail?: string) {
    console.log('=== UPDATING DISCOUNT CODE ===');
    console.log('ID:', id);
    console.log('Updates:', updates);
    console.log('Admin email:', adminEmail);

    try {
      // Set admin context if provided
      if (adminEmail) {
        await setAdminContext(adminEmail);
        
        // Test admin access
        const hasAccess = await testAdminAccess();
        if (!hasAccess) {
          throw new Error('Admin access verification failed');
        }
      }

      const { data, error } = await supabase
        .from('discount_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating discount code:', error);
        throw error;
      }

      console.log('Discount code updated:', data);
      return data;
    } catch (error) {
      console.error('Error in updateDiscountCode:', error);
      throw error;
    }
  },

  async deleteDiscountCode(id: string, adminEmail?: string) {
    console.log('=== DELETING DISCOUNT CODE ===');
    console.log('ID:', id);
    console.log('Admin email:', adminEmail);

    try {
      // Set admin context if provided
      if (adminEmail) {
        await setAdminContext(adminEmail);
        
        // Test admin access
        const hasAccess = await testAdminAccess();
        if (!hasAccess) {
          throw new Error('Admin access verification failed');
        }
      }

      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting discount code:', error);
        throw error;
      }

      console.log('Discount code deleted successfully');
    } catch (error) {
      console.error('Error in deleteDiscountCode:', error);
      throw error;
    }
  },

  async validateDiscountCode(code: string) {
    console.log('=== VALIDATING DISCOUNT CODE ===');
    console.log('Code:', code);

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error validating discount code:', error);
      return { valid: false, error: 'Invalid discount code' };
    }

    // Check if code has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Discount code has expired' };
    }

    // Check if code has reached max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Discount code has reached maximum usage limit' };
    }

    return {
      valid: true,
      discountCode: data,
      discountPercent: data.discount_percent
    };
  },

  async incrementCodeUsage(id: string, adminEmail?: string) {
    console.log('=== INCREMENTING CODE USAGE ===');
    console.log('ID:', id);
    console.log('Admin email:', adminEmail);

    try {
      // Set admin context if provided
      if (adminEmail) {
        await setAdminContext(adminEmail);
      }

      // First get current usage count
      const { data: currentData, error: fetchError } = await supabase
        .from('discount_codes')
        .select('current_uses')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching current usage:', fetchError);
        throw fetchError;
      }

      // Increment and update
      const { error } = await supabase
        .from('discount_codes')
        .update({ 
          current_uses: (currentData.current_uses || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing code usage:', error);
        throw error;
      }

      console.log('Code usage incremented successfully');
    } catch (error) {
      console.error('Error in incrementCodeUsage:', error);
      throw error;
    }
  }
};
