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

// Enhanced helper function to set admin context with better error handling
const setAdminContext = async (adminEmail: string) => {
  console.log('🔧 Setting admin context for discount operations:', adminEmail);
  
  try {
    // First verify the admin exists
    const { data: adminCheck, error: adminError } = await supabase
      .from('teachers')
      .select('id, email, role')
      .eq('email', adminEmail)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      console.error('❌ Admin verification failed:', adminError);
      throw new Error(`Admin ${adminEmail} not found or not authorized`);
    }

    console.log('✅ Admin verified:', adminCheck);

    // Set the context
    const { error } = await supabase.rpc('set_platform_admin_context', { 
      admin_email: adminEmail 
    });
    
    if (error) {
      console.error('❌ Error setting admin context:', error);
      throw new Error('Failed to set admin context: ' + error.message);
    }
    
    console.log('✅ Admin context set successfully');

    // Verify the context was set
    const { data: contextTest, error: contextError } = await supabase
      .rpc('is_platform_admin');

    if (contextError) {
      console.warn('⚠️ Could not verify context setting:', contextError);
    } else {
      console.log('🔍 Platform admin context verified:', contextTest);
    }

  } catch (error) {
    console.error('💥 Critical error in setAdminContext:', error);
    throw error;
  }
};

export const discountCodeService = {
  async testConnection(adminEmail?: string) {
    console.log('🧪 TESTING DISCOUNT CODE CONNECTION');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required for testing');
      }
      
      // Set admin context with enhanced error handling
      await setAdminContext(adminEmail);
      
      // Test if we can read discount codes
      console.log('📋 Testing read access to discount codes...');
      const { data, error, count } = await supabase
        .from('discount_codes')
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('❌ Read test failed:', error);
        return { success: false, error: error.message, operation: 'read' };
      }

      console.log('✅ Read test successful. Found', count, 'discount codes');

      // Test if we can create a discount code (test entry)
      console.log('📝 Testing write access...');
      const testCode = {
        code: 'TEST_' + Date.now(),
        discount_percent: 10,
        description: 'Test code - will be deleted',
        school_name: 'Test School',
        is_active: false
      };

      const { data: createData, error: createError } = await supabase
        .from('discount_codes')
        .insert([{
          ...testCode,
          created_by: adminEmail,
          current_uses: 0
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Write test failed:', createError);
        return { success: false, error: createError.message, operation: 'write' };
      }

      console.log('✅ Write test successful. Created test code:', createData.id);

      // Clean up test code
      const { error: deleteError } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', createData.id);

      if (deleteError) {
        console.warn('⚠️ Failed to clean up test code:', deleteError);
      } else {
        console.log('🧹 Test code cleaned up successfully');
      }

      return { 
        success: true, 
        message: 'All tests passed successfully!',
        readCount: count,
        testCodeId: createData.id
      };

    } catch (error) {
      console.error('💥 Test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'setup'
      };
    }
  },

  async getAllDiscountCodes(adminEmail?: string) {
    console.log('=== FETCHING DISCOUNT CODES ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      // Set admin context with enhanced error handling
      await setAdminContext(adminEmail);
      
      console.log('📋 Attempting to fetch discount codes...');
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching discount codes:', error);
        throw error;
      }

      console.log('✅ Discount codes loaded successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 Error in getAllDiscountCodes:', error);
      throw error;
    }
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string, adminEmail?: string) {
    console.log('=== CREATING DISCOUNT CODE ===');
    console.log('📝 Code data:', codeData);
    console.log('👤 Created by:', createdBy);
    console.log('📧 Admin email:', adminEmail);

    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      // Set admin context with enhanced error handling
      await setAdminContext(adminEmail);

      console.log('🔨 Attempting to create discount code...');
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
        console.error('❌ Error creating discount code:', error);
        throw error;
      }

      console.log('✅ Discount code created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 Error in createDiscountCode:', error);
      throw error;
    }
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData, adminEmail?: string) {
    console.log('=== UPDATING DISCOUNT CODE ===');
    console.log('🆔 ID:', id);
    console.log('📝 Updates:', updates);
    console.log('📧 Admin email:', adminEmail);

    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      await setAdminContext(adminEmail);

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
        console.error('❌ Error updating discount code:', error);
        throw error;
      }

      console.log('✅ Discount code updated:', data);
      return data;
    } catch (error) {
      console.error('💥 Error in updateDiscountCode:', error);
      throw error;
    }
  },

  async deleteDiscountCode(id: string, adminEmail?: string) {
    console.log('=== DELETING DISCOUNT CODE ===');
    console.log('🆔 ID:', id);
    console.log('📧 Admin email:', adminEmail);

    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      await setAdminContext(adminEmail);

      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting discount code:', error);
        throw error;
      }

      console.log('✅ Discount code deleted successfully');
    } catch (error) {
      console.error('💥 Error in deleteDiscountCode:', error);
      throw error;
    }
  },

  async validateDiscountCode(code: string) {
    console.log('=== VALIDATING DISCOUNT CODE ===');
    console.log('🔍 Code:', code);

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Error validating discount code:', error);
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
    console.log('🆔 ID:', id);
    console.log('📧 Admin email:', adminEmail);

    try {
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
        console.error('❌ Error fetching current usage:', fetchError);
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
        console.error('❌ Error incrementing code usage:', error);
        throw error;
      }

      console.log('✅ Code usage incremented successfully');
    } catch (error) {
      console.error('💥 Error in incrementCodeUsage:', error);
      throw error;
    }
  }
};
