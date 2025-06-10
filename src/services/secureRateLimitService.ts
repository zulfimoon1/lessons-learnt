
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes?: number;
}

class SecureRateLimitService {
  private readonly defaultConfig: RateLimitConfig = {
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30
  };

  async checkRateLimit(
    identifier: string,
    action: string,
    config: Partial<RateLimitConfig> = {}
  ): Promise<{ allowed: boolean; remainingAttempts?: number; resetTime?: Date; message?: string }> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      
      // Use client-side rate limiting with audit log table
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - finalConfig.windowMinutes);
      
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'rate_limit_check')
        .gte('timestamp', windowStart.toISOString())
        .like('new_data->>identifier', `${identifier}-${action}%`)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Fail closed - deny access on error
        return { 
          allowed: false, 
          message: 'Security check failed. Please try again later.' 
        };
      }

      const attemptCount = data?.length || 0;
      
      if (attemptCount >= finalConfig.maxAttempts) {
        const resetTime = new Date();
        resetTime.setMinutes(resetTime.getMinutes() + (finalConfig.blockDurationMinutes || 30));
        
        return {
          allowed: false,
          resetTime,
          message: `Too many attempts. Please try again after ${finalConfig.blockDurationMinutes || 30} minutes.`
        };
      }

      return { 
        allowed: true,
        remainingAttempts: finalConfig.maxAttempts - attemptCount
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return { 
        allowed: false, 
        message: 'Security check failed. Please try again later.' 
      };
    }
  }

  async recordFailedAttempt(identifier: string, action: string, details?: any): Promise<void> {
    try {
      await supabase
        .from('audit_log')
        .insert({
          table_name: 'rate_limit_violation',
          operation: 'FAILED_ATTEMPT',
          new_data: {
            identifier: `${identifier}-${action}`,
            details,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_hash: await this.hashIP() // Simple client-side IP hash
          }
        });
    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  async recordSuccessfulAttempt(identifier: string, action: string): Promise<void> {
    try {
      await supabase
        .from('audit_log')
        .insert({
          table_name: 'rate_limit_success',
          operation: 'SUCCESS',
          new_data: {
            identifier: `${identifier}-${action}`,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Failed to record security event:', error);
    }
  }

  private async hashIP(): Promise<string> {
    try {
      // Simple client-side fingerprinting for additional security
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Security fingerprint', 2, 2);
        return canvas.toDataURL().slice(-50); // Last 50 chars as simple hash
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Progressive delay implementation
  async getProgressiveDelay(identifier: string, action: string): Promise<number> {
    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'rate_limit_violation')
        .like('new_data->>identifier', `${identifier}-${action}%`)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('timestamp', { ascending: false })
        .limit(10);

      const attemptCount = data?.length || 0;
      const delays = [1000, 2000, 5000, 10000, 30000]; // Progressive delays in ms
      
      return delays[Math.min(attemptCount, delays.length - 1)] || delays[delays.length - 1];
    } catch (error) {
      console.error('Error calculating progressive delay:', error);
      return 1000; // Default 1 second delay
    }
  }
}

export const secureRateLimitService = new SecureRateLimitService();
