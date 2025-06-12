
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
    
    try {
      // Check if platform admin is logged in
      const adminData = localStorage.getItem('platformAdmin');
      if (!adminData) {
        throw new Error('Platform admin not authenticated');
      }

      console.log('Platform admin authenticated, fetching discount codes...');

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

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string) {
    console.log('=== CREATING DISCOUNT CODE ===');
    console.log('Code data:', codeData);
    console.log('Created by:', createdBy);

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
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData) {
    console.log('=== UPDATING DISCOUNT CODE ===');
    console.log('ID:', id);
    console.log('Updates:', updates);

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
  },

  async deleteDiscountCode(id: string) {
    console.log('=== DELETING DISCOUNT CODE ===');
    console.log('ID:', id);

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting discount code:', error);
      throw error;
    }

    console.log('Discount code deleted successfully');
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

  async incrementCodeUsage(id: string) {
    console.log('=== INCREMENTING CODE USAGE ===');
    console.log('ID:', id);

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
  }
};
