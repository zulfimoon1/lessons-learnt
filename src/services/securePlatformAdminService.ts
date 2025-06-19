
import { supabase } from '@/integrations/supabase/client';
import { securityValidationService } from './securityValidationService';

export interface SecureAdminLoginData {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
}

class SecurePlatformAdminService {
  private readonly KNOWN_ADMIN = 'zulfimoon1@gmail.com';

  async authenticateAdmin(loginData: SecureAdminLoginData): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    console.log('🔐 ADMIN AUTH for:', loginData.email);
    
    try {
      const adminEmail = loginData.email.toLowerCase().trim();
      
      // Direct authentication for known admin
      if (adminEmail === this.KNOWN_ADMIN && loginData.password === 'admin123') {
        console.log('✅ Known admin authenticated');
        
        return {
          success: true,
          admin: {
            id: 'admin-known',
            email: adminEmail,
            name: 'Platform Admin',
            role: 'admin',
            school: 'Platform Administration'
          }
        };
      }

      return { success: false, error: 'Invalid credentials' };

    } catch (error) {
      console.error('Auth error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async callAdminFunction(operation: string, params: any = {}) {
    console.log(`🔧 Calling admin function: ${operation}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation,
          adminEmail: this.KNOWN_ADMIN,
          ...params
        }
      });

      if (error) {
        console.error(`❌ Admin function error for ${operation}:`, error);
        throw new Error(`Function call failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.error(`❌ No data returned from ${operation}`);
        throw new Error(`No data returned from ${operation}`);
      }

      if (!data.success) {
        console.error(`❌ Function returned error for ${operation}:`, data.error);
        throw new Error(data.error || `Operation ${operation} failed`);
      }

      console.log(`✅ Admin function success: ${operation}`);
      return data.data;
    } catch (error) {
      console.error(`💥 Admin function failed: ${operation}`, error);
      throw error;
    }
  }

  async getPlatformStats(adminEmail: string): Promise<{
    studentsCount: number;
    teachersCount: number;
    responsesCount: number;
    subscriptionsCount: number;
  }> {
    console.log('📊 Getting platform stats via edge function...');
    return await this.callAdminFunction('getPlatformStats');
  }

  async getSchoolData(adminEmail: string): Promise<Array<{
    name: string;
    teacher_count: number;
    student_count: number;
  }>> {
    console.log('🏫 Getting school data via edge function...');
    return await this.callAdminFunction('getSchoolData');
  }

  async getTransactions(adminEmail: string): Promise<any[]> {
    console.log('💳 Getting transactions via edge function...');
    try {
      const transactions = await this.callAdminFunction('getTransactions');
      console.log('💳 Transactions received:', transactions?.length || 0, 'records');
      return transactions || [];
    } catch (error) {
      console.error('💳 Failed to get transactions:', error);
      return [];
    }
  }

  async getPaymentNotifications(adminEmail: string): Promise<any[]> {
    console.log('🔔 Getting payment notifications via edge function...');
    try {
      const notifications = await this.callAdminFunction('getPaymentNotifications');
      console.log('🔔 Payment notifications received:', notifications?.length || 0, 'records');
      return notifications || [];
    } catch (error) {
      console.error('🔔 Failed to get payment notifications:', error);
      return [];
    }
  }

  async createTransaction(adminEmail: string, transactionData: any): Promise<any> {
    console.log('💳 Creating transaction via edge function...');
    return await this.callAdminFunction('createTransaction', { transactionData });
  }

  async cleanupDemoData(adminEmail: string): Promise<any> {
    console.log('🧹 Cleaning up demo data via edge function...');
    return await this.callAdminFunction('cleanupDemoData');
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const emailValidation = securityValidationService.validateInput(email, 'email');
      if (!emailValidation.isValid) {
        return { valid: false };
      }

      if (emailValidation.sanitizedValue === this.KNOWN_ADMIN) {
        return {
          valid: true,
          admin: {
            id: 'admin-validated',
            email: emailValidation.sanitizedValue,
            name: 'Platform Admin',
            role: 'admin',
            school: 'Platform Administration'
          }
        };
      }

      return { valid: false };

    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  async createSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🏫 Creating school via edge function:', schoolName);
    return await this.callAdminFunction('createSchool', { schoolName });
  }

  async deleteSchool(adminEmail: string, schoolName: string): Promise<any> {
    if (adminEmail !== this.KNOWN_ADMIN) {
      throw new Error('Unauthorized: Not a known admin');
    }

    console.log('🗑️ Deleting school via edge function:', schoolName);
    return await this.callAdminFunction('deleteSchool', { schoolName });
  }

  async deleteTransaction(adminEmail: string, transactionId: string): Promise<any> {
    console.log('🗑️ Deleting transaction via edge function:', transactionId);
    return await this.callAdminFunction('deleteTransaction', { transactionId });
  }

  calculateMonthlyRevenue(transactions: any[]): number {
    if (!transactions || transactions.length === 0) {
      console.log('💰 No transactions found for revenue calculation');
      return 0;
    }

    console.log('💰 Calculating revenue from', transactions.length, 'transactions');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = transactions
      .filter(transaction => {
        if (!transaction.created_at) return false;
        
        const transactionDate = new Date(transaction.created_at);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                              transactionDate.getFullYear() === currentYear;
        const isCompleted = transaction.status === 'completed';
        const isPayment = transaction.transaction_type === 'payment';
        
        console.log('💰 Checking transaction:', {
          id: transaction.id,
          amount: transaction.amount,
          date: transaction.created_at,
          isCurrentMonth,
          isCompleted,
          isPayment
        });
        
        return isCurrentMonth && isCompleted && isPayment;
      })
      .reduce((total, transaction) => {
        const amount = transaction.amount || 0;
        console.log('💰 Adding to revenue:', amount / 100, 'EUR');
        return total + amount;
      }, 0);

    console.log('💰 Total monthly revenue:', monthlyRevenue / 100, 'EUR');
    return monthlyRevenue / 100; // Convert from cents to euros
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
