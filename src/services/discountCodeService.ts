
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

      // For now, return mock data due to RLS issues
      const mockDiscountCodes: DiscountCode[] = [
        {
          id: '1',
          code: 'WELCOME10',
          discount_percent: 10,
          description: 'Welcome discount for new schools',
          max_uses: 100,
          current_uses: 5,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_name: null
        }
      ];

      console.log('Discount codes loaded:', mockDiscountCodes.length);
      return mockDiscountCodes;
    } catch (error) {
      console.error('Error in getAllDiscountCodes:', error);
      throw error;
    }
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string) {
    console.log('=== CREATING DISCOUNT CODE ===');
    console.log('Code data:', codeData);
    console.log('Created by:', createdBy);

    // Mock implementation for now
    const newCode: DiscountCode = {
      id: Date.now().toString(),
      code: codeData.code,
      discount_percent: codeData.discount_percent,
      description: codeData.description || null,
      max_uses: codeData.max_uses || null,
      expires_at: codeData.expires_at || null,
      is_active: codeData.is_active !== undefined ? codeData.is_active : true,
      school_name: codeData.school_name || null,
      created_by: createdBy,
      current_uses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Mock discount code created:', newCode);
    return newCode;
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData) {
    console.log('=== UPDATING DISCOUNT CODE ===');
    console.log('ID:', id);
    console.log('Updates:', updates);

    // Mock implementation for now
    const updatedCode: DiscountCode = {
      id,
      code: updates.code || 'UPDATED',
      discount_percent: updates.discount_percent || 10,
      description: updates.description || null,
      max_uses: updates.max_uses || null,
      expires_at: updates.expires_at || null,
      is_active: updates.is_active !== undefined ? updates.is_active : true,
      school_name: updates.school_name || null,
      created_by: 'admin',
      current_uses: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Mock discount code updated:', updatedCode);
    return updatedCode;
  },

  async deleteDiscountCode(id: string) {
    console.log('=== DELETING DISCOUNT CODE ===');
    console.log('ID:', id);
    // Mock implementation - just log success
    console.log('Mock discount code deleted');
  },

  async validateDiscountCode(code: string) {
    console.log('=== VALIDATING DISCOUNT CODE ===');
    console.log('Code:', code);

    // Mock validation
    if (code.toUpperCase() === 'WELCOME10') {
      return {
        valid: true,
        discountCode: {
          id: '1',
          code: 'WELCOME10',
          discount_percent: 10,
          description: 'Welcome discount',
          max_uses: 100,
          current_uses: 5,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_name: null
        } as DiscountCode,
        discountPercent: 10
      };
    }

    return { valid: false, error: 'Invalid discount code' };
  },

  async incrementCodeUsage(id: string) {
    console.log('=== INCREMENTING CODE USAGE ===');
    console.log('ID:', id);
    // Mock implementation
    console.log('Mock usage incremented');
  }
};
