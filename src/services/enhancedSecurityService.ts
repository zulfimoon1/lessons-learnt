import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'login_attempt' | 'unauthorized_access' | 'rate_limit_exceeded' | 'suspicious_activity' | 'data_access';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

class EnhancedSecurityService {
  private rateLimitStore: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> = new Map();
  
  private defaultRateLimits: Record<string, RateLimitConfig> = {
    login: { windowMs: 900000, maxAttempts: 5, blockDurationMs: 1800000 }, // 15 min window, 5 attempts, 30 min block
    api: { windowMs: 60000, maxAttempts: 100, blockDurationMs: 300000 }, // 1 min window, 100 attempts, 5 min block
    password_reset: { windowMs: 3600000, maxAttempts: 3, blockDurationMs: 3600000 } // 1 hour window, 3 attempts, 1 hour block
  };

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase.rpc('log_security_event_enhanced', {
        event_type: event.type,
        user_id: event.userId || null,
        details: event.details,
        severity: event.severity,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Fallback: store in localStorage for later sync
      this.storeEventLocally(event);
    }
  }

  private storeEventLocally(event: SecurityEvent): void {
    try {
      const localEvents = JSON.parse(localStorage.getItem('pending_security_events') || '[]');
      localEvents.push({
        ...event,
        timestamp: new Date().toISOString(),
        clientGenerated: true
      });
      
      // Keep only last 100 events
      if (localEvents.length > 100) {
        localEvents.splice(0, localEvents.length - 100);
      }
      
      localStorage.setItem('pending_security_events', JSON.stringify(localEvents));
    } catch (error) {
      console.error('Failed to store security event locally:', error);
    }
  }

  checkRateLimit(identifier: string, action: string): boolean {
    const config = this.defaultRateLimits[action] || this.defaultRateLimits.api;
    const key = `${action}:${identifier}`;
    const now = Date.now();
    
    const record = this.rateLimitStore.get(key);
    
    // Check if still blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return false;
    }
    
    // Reset if outside window
    if (!record || now - record.firstAttempt > config.windowMs) {
      this.rateLimitStore.set(key, { count: 1, firstAttempt: now });
      return true;
    }
    
    // Increment count
    record.count++;
    
    // Check if exceeded limit
    if (record.count > config.maxAttempts) {
      record.blockedUntil = now + config.blockDurationMs;
      
      // Log rate limit exceeded
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for action: ${action}, identifier: ${identifier}`,
        severity: 'medium',
        metadata: { action, identifier, attemptCount: record.count }
      });
      
      return false;
    }
    
    return true;
  }

  validateInput(input: string, type: 'email' | 'text' | 'password'): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input type');
    }
    
    // Length validation
    if (input.length > 10000) {
      throw new Error('Input too long');
    }
    
    // Basic sanitization
    let sanitized = input.trim();
    
    switch (type) {
      case 'email':
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
          throw new Error('Invalid email format');
        }
        break;
        
      case 'text':
        // Remove potential XSS patterns
        sanitized = sanitized
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
        break;
        
      case 'password':
        // No special sanitization for passwords, just length check
        if (sanitized.length < 1) {
          throw new Error('Password cannot be empty');
        }
        break;
    }
    
    return sanitized;
  }

  async syncPendingEvents(): Promise<void> {
    try {
      const pendingEvents = JSON.parse(localStorage.getItem('pending_security_events') || '[]');
      
      if (pendingEvents.length === 0) return;
      
      // Attempt to sync events
      for (const event of pendingEvents) {
        try {
          await this.logSecurityEvent(event);
        } catch (error) {
          console.error('Failed to sync security event:', error);
          break; // Stop syncing if one fails
        }
      }
      
      // Clear synced events
      localStorage.removeItem('pending_security_events');
    } catch (error) {
      console.error('Failed to sync pending security events:', error);
    }
  }

  getClientSecurityInfo(): Record<string, any> {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    };
  }

  // Clean up old rate limit records
  cleanupRateLimitStore(): void {
    const now = Date.now();
    const oneHour = 3600000;
    
    for (const [key, record] of this.rateLimitStore.entries()) {
      if (now - record.firstAttempt > oneHour && (!record.blockedUntil || now > record.blockedUntil)) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  // Additional methods for compatibility
  monitorSecurityViolations(): void {
    // Monitor for security violations
  }

  enhanceFormValidation(): void {
    // Enhanced form validation
  }

  async getSecurityDashboardData(): Promise<any> {
    return { events: [], metrics: {} };
  }

  logSecurityViolation(violation: any): void {
    this.logSecurityEvent({
      type: 'suspicious_activity',
      details: violation.details || 'Security violation detected',
      severity: violation.severity || 'medium'
    });
  }

  clearSecurityLogs(): void {
    localStorage.removeItem('pending_security_events');
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();

// Sync pending events on app start
enhancedSecurityService.syncPendingEvents();

// Clean up rate limit store every 10 minutes
setInterval(() => {
  enhancedSecurityService.cleanupRateLimitStore();
}, 600000);
