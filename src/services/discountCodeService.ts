
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
  async getAllDiscountCodes() {
    console.log('=== FETCHING DISCOUNT CODES ===');
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Discount codes query result:', { data, error });

    if (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }

    return data as DiscountCode[];
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string) {
    console.log('=== CREATING DISCOUNT CODE ===');
    console.log('Code data:', codeData);
    console.log('Created by:', createdBy);

    const insertData = {
      code: codeData.code,
      discount_percent: codeData.discount_percent,
      description: codeData.description || null,
      max_uses: codeData.max_uses || null,
      expires_at: codeData.expires_at || null,
      is_active: codeData.is_active !== undefined ? codeData.is_active : true,
      school_name: codeData.school_name || null,
      created_by: createdBy,
    };

    console.log('Insert data:', insertData);

    const { data, error } = await supabase
      .from('discount_codes')
      .insert(insertData)
      .select()
      .single();

    console.log('Insert result:', { data, error });

    if (error) {
      console.error('Error creating discount code:', error);
      throw error;
    }

    return data as DiscountCode;
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData) {
    console.log('=== UPDATING DISCOUNT CODE ===');
    console.log('ID:', id);
    console.log('Updates:', updates);

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    console.log('Update data:', updateData);

    const { data, error } = await supabase
      .from('discount_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Error updating discount code:', error);
      throw error;
    }

    return data as DiscountCode;
  },

  async deleteDiscountCode(id: string) {
    console.log('=== DELETING DISCOUNT CODE ===');
    console.log('ID:', id);

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    console.log('Delete result:', { error });

    if (error) {
      console.error('Error deleting discount code:', error);
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

    console.log('Validation result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        return { valid: false, error: 'Invalid discount code' };
      }
      throw error;
    }

    const discountCode = data as DiscountCode;

    // Check if expired
    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      return { valid: false, error: 'Discount code has expired' };
    }

    // Check if usage limit reached
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      return { valid: false, error: 'Discount code usage limit reached' };
    }

    return {
      valid: true,
      discountCode,
      discountPercent: discountCode.discount_percent
    };
  },

  async incrementCodeUsage(id: string) {
    console.log('=== INCREMENTING CODE USAGE ===');
    console.log('ID:', id);

    // First get the current usage count
    const { data: currentCode, error: fetchError } = await supabase
      .from('discount_codes')
      .select('current_uses')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current usage:', fetchError);
      throw fetchError;
    }

    console.log('Current usage:', currentCode.current_uses);

    // Then update with incremented value
    const { error } = await supabase
      .from('discount_codes')
      .update({
        current_uses: (currentCode.current_uses || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error incrementing code usage:', error);
      throw error;
    }

    console.log('Usage incremented successfully');
  }
};
