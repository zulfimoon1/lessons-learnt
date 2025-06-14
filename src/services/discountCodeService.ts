
import { secureDiscountCodeService } from './secureDiscountCodeService';

// Legacy service - now redirects to secure implementation
console.log('⚠️ Legacy discountCodeService loaded - all operations redirect to secure service');

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

// Redirect all operations to secure service
export const discountCodeService = {
  async testConnection(adminEmail?: string) {
    return await secureDiscountCodeService.testConnection(adminEmail);
  },

  async getAllDiscountCodes(adminEmail?: string) {
    return await secureDiscountCodeService.getAllDiscountCodes(adminEmail);
  },

  async createDiscountCode(codeData: CreateDiscountCodeData, createdBy: string, adminEmail?: string) {
    return await secureDiscountCodeService.createDiscountCode(codeData, createdBy, adminEmail);
  },

  async updateDiscountCode(id: string, updates: Partial<CreateDiscountCodeData>, adminEmail?: string) {
    return await secureDiscountCodeService.updateDiscountCode(id, updates, adminEmail);
  },

  async deleteDiscountCode(id: string, adminEmail?: string) {
    return await secureDiscountCodeService.deleteDiscountCode(id, adminEmail);
  },

  async validateDiscountCode(code: string, teacherEmail?: string) {
    return await secureDiscountCodeService.validateDiscountCode(code, teacherEmail);
  },

  async incrementCodeUsage(id: string, adminEmail?: string) {
    return await secureDiscountCodeService.incrementCodeUsage(id, adminEmail);
  }
};
