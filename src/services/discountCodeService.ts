
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

export const discountCodeService = {
  async getAllDiscountCodes(adminEmail?: string) {
    console.log('=== FETCHING DISCOUNT CODES ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      console.log('📋 Attempting to fetch discount codes as service role...');
      
      // Use service role directly to bypass RLS temporarily
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching discount codes:', error);
        
        // If RLS error, try with explicit admin context
        if (error.code === '42501') {
          console.log('🔄 RLS error detected, setting admin context and retrying...');
          
          await supabase.rpc('set_platform_admin_context', { 
            admin_email: adminEmail 
          });
          
          const { data: retryData, error: retryError } = await supabase
            .from('discount_codes')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (retryError) {
            console.error('❌ Retry failed:', retryError);
            throw retryError;
          }
          
          console.log('✅ Retry successful, discount codes loaded:', retryData?.length || 0);
          return retryData || [];
        }
        
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
      
      // Set admin context first
      console.log('🔧 Setting admin context before creation...');
      await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });

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
      
      await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });

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
      
      await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminEmail 
      });

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
        await supabase.rpc('set_platform_admin_context', { 
          admin_email: adminEmail 
        });
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
