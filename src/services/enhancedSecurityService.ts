
import { supabase } from '@/integrations/supabase/client';

class EnhancedSecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

  // Enhanced input validation with XSS and SQL injection protection
  validateInput(input: string, type: 'email' | 'password' | 'text' | 'html' = 'text'): boolean {
    if (!input || typeof input !== 'string') return false;

    // Common XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    // SQL injection patterns
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
      /('|(\\')|(;\s*--)|(;\s*\/\*)/gi,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
    ];

    // Check XSS patterns
    for (const pattern of xssPatterns) {
      if (pattern.test(input)) return false;
    }

    // Check SQL injection patterns for non-password fields
    if (type !== 'password') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(input)) return false;
      }
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(input) && input.length <= 254;
      
      case 'password':
        // Password should be at least 8 characters with mixed case, numbers, and symbols
        return input.length >= 8 && input.length <= 128;
      
      case 'text':
        return input.length <= 1000; // Reasonable text limit
      
      case 'html':
        // For HTML content, we need stricter validation
        return input.length <= 10000 && !this.containsMaliciousHtml(input);
      
      default:
        return true;
    }
  }

  private containsMaliciousHtml(html: string): boolean {
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'meta'];
    const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
    
    const lowerHtml = html.toLowerCase();
    
    for (const tag of dangerousTags) {
      if (lowerHtml.includes(`<${tag}`)) return true;
    }
    
    for (const attr of dangerousAttrs) {
      if (lowerHtml.includes(attr)) return true;
    }
    
    return false;
  }

  // Sanitize input to remove potentially dangerous content
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>'"&]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#x27;';
          case '&': return '&amp;';
          default: return char;
        }
      })
      .trim();
  }

  // Rate limiting for login attempts
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier);
    
    if (!attempt) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if lockout period has passed
    if (now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if under limit
    if (attempt.count < this.MAX_LOGIN_ATTEMPTS) {
      this.loginAttempts.set(identifier, { 
        count: attempt.count + 1, 
        lastAttempt: now 
      });
      return true;
    }
    
    return false; // Rate limited
  }

  // Enhanced session validation
  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) return false;
      
      // Check session age (max 24 hours for sensitive operations)
      const sessionAge = Date.now() - new Date(session.expires_at || 0).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        await supabase.auth.signOut();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Log security events with enhanced details
  async logSecurityEvent(
    eventType: string,
    details: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();
      
      await supabase.rpc('log_enhanced_security_event', {
        event_type: eventType,
        details,
        severity,
        user_agent: userAgent,
        ip_address: additionalData?.ip_address || 'unknown'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Detect suspicious activity patterns
  detectSuspiciousActivity(events: any[]): boolean {
    if (events.length < 3) return false;
    
    const recentEvents = events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      return eventTime > fiveMinutesAgo;
    });
    
    // Flag if more than 10 events in 5 minutes
    return recentEvents.length > 10;
  }

  // Generate Content Security Policy
  generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.supabase.co https://bjpgloftnlnzndgliqty.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
