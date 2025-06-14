
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
  duration_months: number | null;
}

export interface CreateDiscountCodeData {
  code: string;
  discount_percent: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
  school_name?: string;
  duration_months?: number;
}

export interface UpdateDiscountCodeData {
  code?: string;
  discount_percent?: number;
  description?: string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean;
  school_name?: string;
  duration_months?: number;
}

// Security validation helper
const validateInput = (input: string, type: 'code' | 'description' | 'school'): boolean => {
  if (!input || input.trim().length === 0) return false;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      console.error('Security validation failed: dangerous pattern detected');
      return false;
    }
  }
  
  switch (type) {
    case 'code':
      return /^[A-Z0-9_-]{3,20}$/i.test(input);
    case 'description':
      return input.length <= 500;
    case 'school':
      return input.length >= 2 && input.length <= 100 && !/[<>"';()&+]/.test(input);
    default:
      return true;
  }
};

const validateDiscountPercent = (percent: number): boolean => {
  return Number.isInteger(percent) && percent >= 1 && percent <= 100;
};

const validateMaxUses = (maxUses: number | null): boolean => {
  if (maxUses === null) return true;
  return Number.isInteger(maxUses) && maxUses > 0 && maxUses <= 10000;
};

export const secureDiscountCodeService = {
  async testConnection(adminEmail?: string) {
    console.log('🧪 TESTING SECURE DISCOUNT CODE CONNECTION');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required for testing');
      }
      
      console.log('📋 Testing read access using platform admin function...');
      
      const { data, error } = await supabase.rpc('platform_admin_get_discount_codes', {
        admin_email_param: adminEmail
      });

      if (error) {
        console.error('❌ Read test failed:', error);
        return { success: false, error: error.message, operation: 'read' };
      }

      console.log('✅ Read test successful. Found', data?.length || 0, 'discount codes');
      return { 
        success: true, 
        message: 'Connection test passed successfully!',
        readCount: data?.length || 0
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

  async getAllDiscountCodes(adminEmail?: string): Promise<DiscountCode[]> {
    console.log('=== FETCHING DISCOUNT CODES (SECURE) ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }
      
      console.log('📋 Fetching discount codes using secure platform admin function...');
      const { data, error } = await supabase.rpc('platform_admin_get_discount_codes', {
        admin_email_param: adminEmail
      });

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

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string, adminEmail?: string): Promise<DiscountCode> {
    console.log('=== CREATING DISCOUNT CODE (SECURE) ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }

      // Security validation
      if (!validateInput(codeData.code, 'code')) {
        throw new Error('Invalid discount code format. Use only letters, numbers, hyphens, and underscores (3-20 characters).');
      }

      if (!validateDiscountPercent(codeData.discount_percent)) {
        throw new Error('Discount percent must be an integer between 1 and 100.');
      }

      if (codeData.description && !validateInput(codeData.description, 'description')) {
        throw new Error('Description contains invalid characters or is too long (max 500 characters).');
      }

      if (codeData.school_name && !validateInput(codeData.school_name, 'school')) {
        throw new Error('School name contains invalid characters or invalid length (2-100 characters).');
      }

      if (!validateMaxUses(codeData.max_uses || null)) {
        throw new Error('Max uses must be a positive integer up to 10,000.');
      }

      if (codeData.duration_months && (!Number.isInteger(codeData.duration_months) || codeData.duration_months < 1 || codeData.duration_months > 36)) {
        throw new Error('Duration must be between 1 and 36 months.');
      }

      console.log('🔨 Creating discount code using secure platform admin function...');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('platform_admin_create_discount_code_with_duration', {
          admin_email_param: adminEmail,
          code_param: codeData.code.toUpperCase(),
          discount_percent_param: codeData.discount_percent,
          description_param: codeData.description || null,
          max_uses_param: codeData.max_uses || null,
          expires_at_param: codeData.expires_at || null,
          is_active_param: codeData.is_active !== undefined ? codeData.is_active : true,
          school_name_param: codeData.school_name || null,
          created_by_param: createdBy,
          duration_months_param: codeData.duration_months || null
        });

      if (functionError) {
        console.error('❌ Error creating discount code:', functionError);
        throw functionError;
      }

      if (!functionResult) {
        throw new Error('No data returned from database function');
      }

      console.log('✅ Discount code created successfully:', functionResult);
      return functionResult as DiscountCode;
    } catch (error) {
      console.error('💥 Error in createDiscountCode:', error);
      throw error;
    }
  },

  async updateDiscountCode(id: string, updates: UpdateDiscountCodeData, adminEmail?: string): Promise<DiscountCode> {
    console.log('=== UPDATING DISCOUNT CODE (SECURE) ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }

      // Security validation for updates
      if (updates.code && !validateInput(updates.code, 'code')) {
        throw new Error('Invalid discount code format.');
      }

      if (updates.discount_percent && !validateDiscountPercent(updates.discount_percent)) {
        throw new Error('Invalid discount percent.');
      }

      if (updates.description && !validateInput(updates.description, 'description')) {
        throw new Error('Invalid description.');
      }

      if (updates.school_name && !validateInput(updates.school_name, 'school')) {
        throw new Error('Invalid school name.');
      }

      if (!validateMaxUses(updates.max_uses || null)) {
        throw new Error('Invalid max uses value.');
      }

      const { data, error } = await supabase.rpc('platform_admin_update_discount_code', {
        admin_email_param: adminEmail,
        code_id_param: id,
        code_param: updates.code ? updates.code.toUpperCase() : null,
        discount_percent_param: updates.discount_percent || null,
        description_param: updates.description || null,
        max_uses_param: updates.max_uses || null,
        expires_at_param: updates.expires_at || null,
        is_active_param: updates.is_active !== undefined ? updates.is_active : null,
        school_name_param: updates.school_name || null
      });

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

  async deleteDiscountCode(id: string, adminEmail?: string): Promise<void> {
    console.log('=== DELETING DISCOUNT CODE (SECURE) ===');
    
    try {
      if (!adminEmail) {
        throw new Error('Admin email is required');
      }

      const { error } = await supabase.rpc('platform_admin_delete_discount_code', {
        admin_email_param: adminEmail,
        code_id_param: id
      });

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

  async validateDiscountCode(code: string, teacherEmail?: string) {
    console.log('=== VALIDATING DISCOUNT CODE (SECURE) ===');
    
    try {
      // Input validation
      if (!validateInput(code, 'code')) {
        return { valid: false, error: 'Invalid discount code format' };
      }

      if (teacherEmail) {
        console.log('📋 Attempting validation via platform admin function...');
        
        try {
          const { data: discountCodes, error } = await supabase.rpc('platform_admin_get_discount_codes', {
            admin_email_param: teacherEmail
          });

          if (!error && discountCodes) {
            console.log('✅ Successfully retrieved discount codes via admin function');
            const matchingCode = discountCodes.find(dc => dc.code === code.toUpperCase());
            
            if (!matchingCode) {
              return { valid: false, error: 'Invalid discount code' };
            }

            // Check if code has expired
            if (matchingCode.expires_at && new Date(matchingCode.expires_at) < new Date()) {
              return { valid: false, error: 'Discount code has expired' };
            }

            // Check if code has reached max uses
            if (matchingCode.max_uses && matchingCode.current_uses >= matchingCode.max_uses) {
              return { valid: false, error: 'Discount code has reached maximum usage limit' };
            }

            // Check if code is active
            if (!matchingCode.is_active) {
              return { valid: false, error: 'Discount code is not active' };
            }

            return {
              valid: true,
              discountCode: matchingCode,
              discountPercent: matchingCode.discount_percent,
              durationMonths: matchingCode.duration_months
            };
          }
        } catch (adminError) {
          console.log('⚠️ Admin function failed, falling back to direct query:', adminError);
        }
      }

      // Fallback to direct query (for public validation)
      console.log('📋 Attempting direct validation query...');
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
        discountPercent: data.discount_percent,
        durationMonths: data.duration_months
      };

    } catch (error) {
      console.error('💥 Error in validateDiscountCode:', error);
      return { valid: false, error: 'Failed to validate discount code' };
    }
  },

  async incrementCodeUsage(id: string, adminEmail?: string): Promise<void> {
    console.log('=== INCREMENTING CODE USAGE (SECURE) ===');
    
    try {
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

      // Update with incremented usage
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
