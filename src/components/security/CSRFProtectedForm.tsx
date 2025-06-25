
import React, { useState, useEffect } from 'react';
import { csrfProtectionService } from '@/services/csrfProtectionService';
import { centralizedValidationService } from '@/services/centralizedValidationService';

interface CSRFProtectedFormProps {
  children: React.ReactNode;
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>;
  className?: string;
}

const CSRFProtectedForm: React.FC<CSRFProtectedFormProps> = ({ 
  children, 
  onSubmit, 
  className = '' 
}) => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sessionId = csrfProtectionService.getCurrentSessionId();
    const token = csrfProtectionService.generateCSRFToken(sessionId);
    
    setSessionId(sessionId);
    setCsrfToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate CSRF token
      if (!csrfProtectionService.validateCSRFToken(csrfToken, sessionId)) {
        await centralizedValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: 'CSRF token validation failed on form submission',
          severity: 'high'
        });
        throw new Error('Security validation failed. Please refresh and try again.');
      }

      // Create form data
      const formData = new FormData(e.currentTarget);
      
      // Submit with CSRF token
      await onSubmit(formData, csrfToken);
      
      // Generate new CSRF token for next submission
      const newToken = csrfProtectionService.generateCSRFToken(sessionId);
      setCsrfToken(newToken);
      
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input 
        type="hidden" 
        name="csrf_token" 
        value={csrfToken}
        readOnly
      />
      <input 
        type="hidden" 
        name="session_id" 
        value={sessionId}
        readOnly
      />
      {children}
    </form>
  );
};

export default CSRFProtectedForm;
