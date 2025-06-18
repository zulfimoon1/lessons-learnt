
import React, { useState, useEffect } from 'react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>, csrfToken: string) => Promise<void>;
  validateInputs?: boolean;
}

const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  validateInputs = true
}) => {
  const [csrfToken, setCSRFToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate CSRF token on component mount
    const token = enhancedSecurityService.generateCSRFToken();
    setCSRFToken(token);
    
    // Store token in session for validation
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate CSRF token
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!enhancedSecurityService.validateCSRFToken(csrfToken, storedToken || '')) {
        throw new Error('Invalid CSRF token');
      }
      
      // Check session security
      const isSessionValid = await enhancedSecurityService.checkSessionSecurity();
      if (!isSessionValid) {
        throw new Error('Invalid session');
      }
      
      // Extract and sanitize form data
      const formData = new FormData(event.currentTarget);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
      
      // Sanitize form data
      const sanitizedData = enhancedSecurityService.sanitizeFormData(data);
      
      // Additional input validation if enabled
      if (validateInputs) {
        for (const [key, value] of Object.entries(sanitizedData)) {
          if (typeof value === 'string' && value.length > 0) {
            let inputType: 'email' | 'password' | 'name' | 'text' = 'text';
            
            if (key.toLowerCase().includes('email')) inputType = 'email';
            else if (key.toLowerCase().includes('password')) inputType = 'password';
            else if (key.toLowerCase().includes('name')) inputType = 'name';
            
            if (!enhancedSecurityService.validateInputSecurity(value, inputType)) {
              throw new Error(`Invalid input for field: ${key}`);
            }
          }
        }
      }
      
      await onSubmit(sanitizedData, csrfToken);
    } catch (error) {
      console.error('Secure form submission error:', error);
      
      await enhancedSecurityService.logSecurityEvent({
        type: 'form_submission_error',
        details: `Form submission failed: ${error}`,
        severity: 'medium'
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};

export default SecureFormWrapper;
