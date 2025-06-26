
import React, { useState } from 'react';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (formData: FormData, csrfToken: string) => Promise<void>;
  className?: string;
}

const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // Generate CSRF token
      const csrfToken = enhancedSecurityValidationService.generateCSRFToken();
      
      // Get form data
      const formData = new FormData(e.currentTarget);
      
      // Add CSRF token to form data
      formData.append('csrf_token', csrfToken);
      
      // Call the parent's submit handler
      await onSubmit(formData, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Log security event for failed form submission
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Form submission failed: ${error}`,
        severity: 'medium'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

export default SecureFormWrapper;
