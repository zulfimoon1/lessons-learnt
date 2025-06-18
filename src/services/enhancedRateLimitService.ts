
import { supabase } from '@/integrations/supabase/client';

interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: number;
  blocked: boolean;
}

class EnhancedRateLimitService {
  private static readonly WINDOW_SIZE = 60 * 1000; // 1 minute
  private static readonly MAX_ATTEMPTS = {
    login: 5,
    signup: 3,
    feedback: 10,
    chat: 30,
    general: 100
  };

  private cache = new Map<string, RateLimitEntry>();

  private getClientId(): string {
    // Create a unique identifier for the client
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height
    ].join('|');
    
    return btoa(fingerprint).slice(0, 16);
  }

  async checkRateLimit(action: keyof typeof EnhancedRateLimitService.MAX_ATTEMPTS, userId?: string): Promise<boolean> {
    const clientId = this.getClientId();
    const key = `${action}:${userId || clientId}`;
    const now = Date.now();
    const maxAttempts = EnhancedRateLimitService.MAX_ATTEMPTS[action];

    let entry = this.cache.get(key);
    
    if (!entry || now - entry.windowStart > EnhancedRateLimitService.WINDOW_SIZE) {
      // New window
      entry = {
        key,
        count: 0,
        windowStart: now,
        blocked: false
      };
    }

    entry.count++;
    
    if (entry.count > maxAttempts) {
      entry.blocked = true;
      
      // Log security event for repeated violations
      if (entry.count === maxAttempts + 1) {
        await this.logSecurityEvent('rate_limit_exceeded', userId, `Action: ${action}, Client: ${clientId}`, 'medium');
      }
      
      this.cache.set(key, entry);
      return false;
    }

    this.cache.set(key, entry);
    return true;
  }

  async logAttempt(action: string, success: boolean, userId?: string): Promise<void> {
    if (!success) {
      const clientId = this.getClientId();
      await this.logSecurityEvent('failed_attempt', userId, `Action: ${action}, Client: ${clientId}`, 'low');
    }
  }

  private async logSecurityEvent(eventType: string, userId: string | undefined, details: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    try {
      await supabase.rpc('log_security_event_safe', {
        event_type: eventType,
        user_id: userId || null,
        details,
        severity
      });
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }

  // Progressive delay for suspicious behavior
  getProgressiveDelay(attemptCount: number): number {
    return Math.min(1000 * Math.pow(2, attemptCount - 1), 30000); // Max 30 seconds
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.windowStart > EnhancedRateLimitService.WINDOW_SIZE * 2) {
        this.cache.delete(key);
      }
    }
  }
}

export const enhancedRateLimitService = new EnhancedRateLimitService();

// Cleanup every 5 minutes
setInterval(() => {
  enhancedRateLimitService.cleanup();
}, 5 * 60 * 1000);
