
import { supabase } from '@/integrations/supabase/client';

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sanitizedValue?: string;
}

interface SecurityEventLog {
  type: 'unauthorized_access' | 'suspicious_activity' | 'form_validation_failed' | 'rate_limit_exceeded';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent?: string;
  ipAddress?: string;
  severity: 'low' | 'medium' | 'high';
}

class SecurityValidationService {
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 30;

  // Enhanced input validation with XSS and injection prevention
  validateInput(input: string, fieldName: string, options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    requireAlphanumeric?: boolean;
  } = {}): SecurityValidationResult {
    const errors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    const {
      maxLength = 1000,
      minLength = 0,
      allowHtml = false,
      requireAlphanumeric = false
    } = options;

    // Length validation
    if (input.length > maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
      riskLevel = 'medium';
    }

    if (input.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
      riskLevel = 'medium';
    }

    // XSS prevention
    if (!allowHtml && this.containsHtmlTags(input)) {
      errors.push(`${fieldName} contains potentially dangerous HTML content`);
      riskLevel = 'high';
    }

    // SQL injection prevention
    if (this.containsSqlInjectionPattern(input)) {
      errors.push(`${fieldName} contains potentially dangerous SQL patterns`);
      riskLevel = 'high';
    }

    // Script injection prevention
    if (this.containsScriptInjection(input)) {
      errors.push(`${fieldName} contains potentially dangerous script content`);
      riskLevel = 'high';
    }

    // Alphanumeric requirement
    if (requireAlphanumeric && !/^[a-zA-Z0-9\s\-_.,!?]+$/.test(input)) {
      errors.push(`${fieldName} contains invalid characters`);
      riskLevel = 'medium';
    }

    // Check for mental health risk keywords
    const mentalHealthRisk = this.detectMentalHealthRisk(input);
    if (mentalHealthRisk.level > 0) {
      // Don't add to errors, but log for monitoring
      this.logSecurityEvent('suspicious_activity', undefined, 
        `Mental health risk level ${mentalHealthRisk.level} detected in ${fieldName}`, 'medium');
    }

    return {
      isValid: errors.length === 0,
      errors,
      riskLevel,
      sanitizedValue: errors.length === 0 ? input.trim() : undefined
    };
  }

  // Rate limiting with enhanced tracking
  checkRateLimit(identifier: string, maxAttempts: number = this.MAX_REQUESTS_PER_WINDOW, windowMs: number = this.RATE_LIMIT_WINDOW): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(identifier);

    if (!userLimit || now - userLimit.lastReset > windowMs) {
      this.rateLimitMap.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    if (userLimit.count >= maxAttempts) {
      this.logSecurityEvent('rate_limit_exceeded', identifier, 
        `Rate limit exceeded: ${userLimit.count} requests in window`, 'medium');
      return false;
    }

    userLimit.count++;
    return true;
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    // In a real implementation, you'd store and validate against server-side tokens
    return token === sessionToken && token.length === 64;
  }

  // Enhanced logging - use direct audit log insertion instead of RPC
  async logSecurityEvent(
    type: SecurityEventLog['type'],
    userId?: string,
    details: string = '',
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      // Insert directly into audit_log table instead of using RPC
      await supabase.from('audit_log').insert({
        table_name: 'security_violations',
        operation: type,
        user_id: userId || null,
        new_data: {
          details,
          severity,
          timestamp: new Date().toISOString(),
          source: 'security_monitoring'
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Private helper methods
  private containsHtmlTags(input: string): boolean {
    const htmlPattern = /<[^>]*>/gi;
    return htmlPattern.test(input);
  }

  private containsSqlInjectionPattern(input: string): boolean {
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bALTER\b)/gi,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
      /['";]\s*(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?/gi,
      /(\bEXEC\b|\bEXECUTE\b|\bsp_\w+)/gi
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  private containsScriptInjection(input: string): boolean {
    const scriptPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ];
    
    return scriptPatterns.some(pattern => pattern.test(input));
  }

  private detectMentalHealthRisk(text: string): { level: number; keywords: string[] } {
    const highRiskKeywords = ['kill myself', 'end my life', 'want to die', 'suicide', 'hurt myself', 'cut myself'];
    const mediumRiskKeywords = ['hopeless', 'worthless', 'hate myself', 'better off dead', 'no point living', 'cant go on'];
    const lowRiskKeywords = ['depressed', 'sad all the time', 'feel empty', 'dont care anymore', 'tired of everything'];
    
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];
    
    for (const keyword of highRiskKeywords) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        return { level: 5, keywords: foundKeywords };
      }
    }
    
    for (const keyword of mediumRiskKeywords) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    if (foundKeywords.length > 0) {
      return { level: 3, keywords: foundKeywords };
    }
    
    for (const keyword of lowRiskKeywords) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    return { level: foundKeywords.length > 0 ? 1 : 0, keywords: foundKeywords };
  }

  // Authentication validation
  validateAuthContext(requiredRole?: string[], requiredSchool?: string): {
    isValid: boolean;
    user: any;
    error?: string;
  } {
    // This would integrate with your existing auth system
    // For now, returning a basic structure
    return {
      isValid: false,
      user: null,
      error: 'Authentication validation not implemented'
    };
  }

  validateSessionSecurity(): boolean {
    // Check for session hijacking indicators
    const currentUserAgent = navigator.userAgent;
    const storedUserAgent = sessionStorage.getItem('initial_user_agent');
    
    if (storedUserAgent && storedUserAgent !== currentUserAgent) {
      this.logSecurityEvent('suspicious_activity', undefined, 
        'User agent changed during session', 'high');
      return false;
    }
    
    if (!storedUserAgent) {
      sessionStorage.setItem('initial_user_agent', currentUserAgent);
    }
    
    return true;
  }
}

export const securityValidationService = new SecurityValidationService();
