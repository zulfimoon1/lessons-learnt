
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
}

export interface CreateDiscountCodeData {
  code: string;
  discount_percent: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
}

export interface UpdateDiscountCodeData {
  code?: string;
  discount_percent?: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
}

export const discountCodeService = {
  async getAllDiscountCodes() {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }

    return data as DiscountCode[];
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string) {
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        ...codeData,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating discount code:', error);
      throw error;
    }

    return data as DiscountCode;
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData) {
    const { data, error } = await supabase
      .from('discount_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating discount code:', error);
      throw error;
    }

    return data as DiscountCode;
  },

  async deleteDiscountCode(id: string) {
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting discount code:', error);
      throw error;
    }
  },

  async validateDiscountCode(code: string) {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

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
    const { error } = await supabase
      .from('discount_codes')
      .update({
        current_uses: supabase.sql`current_uses + 1`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error incrementing code usage:', error);
      throw error;
    }
  }
};
