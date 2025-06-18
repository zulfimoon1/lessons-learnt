
import { supabase } from '@/integrations/supabase/client';

class SecureErrorHandlingService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  sanitizeError(error: any): string {
    if (!error) return 'An unexpected error occurred';

    // In development, show more details
    if (this.isDevelopment) {
      return error.message || error.toString();
    }

    // In production, sanitize error messages
    const errorString = error.message || error.toString();
    
    // Database errors
    if (errorString.includes('permission denied') || errorString.includes('RLS')) {
      return 'Access denied. Please check your permissions.';
    }
    
    if (errorString.includes('duplicate key') || errorString.includes('already exists')) {
      return 'This record already exists.';
    }
    
    if (errorString.includes('foreign key') || errorString.includes('constraint')) {
      return 'Invalid data provided.';
    }
    
    // Network errors
    if (errorString.includes('network') || errorString.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    
    // Authentication errors
    if (errorString.includes('unauthorized') || errorString.includes('auth')) {
      return 'Authentication failed. Please log in again.';
    }
    
    // Generic fallback
    return 'An error occurred. Please try again.';
  }

  async logError(error: any, context: string, userId?: string): Promise<void> {
    try {
      const errorDetails = {
        message: error.message || error.toString(),
        stack: this.isDevelopment ? error.stack : 'Stack trace hidden in production',
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      await supabase.rpc('log_security_event_safe', {
        event_type: 'application_error',
        user_id: userId || null,
        details: JSON.stringify(errorDetails),
        severity: 'medium'
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  handleAuthError(error: any): string {
    const message = this.sanitizeError(error);
    
    // Log authentication errors as security events
    this.logError(error, 'authentication_error');
    
    return message;
  }

  handleDatabaseError(error: any, userId?: string): string {
    const message = this.sanitizeError(error);
    
    // Log database errors
    this.logError(error, 'database_error', userId);
    
    return message;
  }

  handleNetworkError(error: any): string {
    const message = this.sanitizeError(error);
    
    // Log network errors
    this.logError(error, 'network_error');
    
    return message;
  }
}

export const secureErrorHandlingService = new SecureErrorHandlingService();
