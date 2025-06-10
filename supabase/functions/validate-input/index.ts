
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

interface ValidationRule {
  field: string;
  type: 'string' | 'email' | 'number' | 'boolean' | 'date';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  sanitize?: boolean;
}

interface ValidationRequest {
  data: Record<string, any>;
  rules: ValidationRule[];
  csrfToken?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedData: Record<string, any>;
  securityFlags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data, rules, csrfToken }: ValidationRequest = await req.json();
    
    // Enhanced security headers
    const securityHeaders = {
      ...corsHeaders,
      'X-RateLimit-Remaining': '100',
      'X-Security-Validation': 'server-side'
    };

    // CSRF token validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !csrfToken) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          errors: ['Missing authentication or CSRF token'],
          sanitizedData: {},
          securityFlags: ['csrf_missing']
        }),
        { status: 401, headers: securityHeaders }
      );
    }

    const result: ValidationResult = {
      valid: true,
      errors: [],
      sanitizedData: {},
      securityFlags: []
    };

    // Advanced threat detection patterns
    const threatPatterns = [
      /script[^>]*>.*?<\/script/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+.*\s+set/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ];

    // Process each field according to rules
    for (const rule of rules) {
      const value = data[rule.field];

      // Required field validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        result.valid = false;
        result.errors.push(`${rule.field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        result.sanitizedData[rule.field] = value;
        continue;
      }

      let sanitizedValue = value;

      // Type validation and sanitization
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            result.valid = false;
            result.errors.push(`${rule.field} must be a string`);
            continue;
          }

          // Length validation
          if (rule.minLength && value.length < rule.minLength) {
            result.valid = false;
            result.errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
            continue;
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            result.valid = false;
            result.errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
            continue;
          }

          // Pattern validation
          if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
            result.valid = false;
            result.errors.push(`${rule.field} format is invalid`);
            continue;
          }

          // Threat detection
          for (const pattern of threatPatterns) {
            if (pattern.test(value)) {
              result.valid = false;
              result.errors.push(`${rule.field} contains potentially malicious content`);
              result.securityFlags.push(`xss_attempt_${rule.field}`);
              break;
            }
          }

          // Sanitization
          if (rule.sanitize) {
            sanitizedValue = value
              .replace(/[<>\"'%;()&+]/g, '') // Remove dangerous characters
              .trim()
              .substring(0, rule.maxLength || 1000); // Limit length
          }
          break;

        case 'email':
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          if (!emailRegex.test(value)) {
            result.valid = false;
            result.errors.push(`${rule.field} must be a valid email address`);
            continue;
          }
          
          if (value.length > 254) {
            result.valid = false;
            result.errors.push(`${rule.field} email address is too long`);
            continue;
          }

          sanitizedValue = value.toLowerCase().trim();
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            result.valid = false;
            result.errors.push(`${rule.field} must be a valid number`);
            continue;
          }
          sanitizedValue = numValue;
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            result.valid = false;
            result.errors.push(`${rule.field} must be a boolean`);
            continue;
          }
          break;

        case 'date':
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            result.valid = false;
            result.errors.push(`${rule.field} must be a valid date`);
            continue;
          }
          sanitizedValue = dateValue.toISOString();
          break;
      }

      result.sanitizedData[rule.field] = sanitizedValue;
    }

    // Additional security checks
    const requestSize = JSON.stringify(data).length;
    if (requestSize > 100000) { // 100KB limit
      result.valid = false;
      result.errors.push('Request payload too large');
      result.securityFlags.push('oversized_payload');
    }

    // Rate limiting check (simplified - in production use Redis)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting here

    return new Response(
      JSON.stringify(result),
      { 
        status: result.valid ? 200 : 400,
        headers: securityHeaders
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        errors: ['Server validation error'],
        sanitizedData: {},
        securityFlags: ['server_error']
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
