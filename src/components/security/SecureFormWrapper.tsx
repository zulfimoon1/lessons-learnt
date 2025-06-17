
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
  const [csrfToken] = useState(() => enhancedSecurityValidationService.generateCSRFToken());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    // Add CSRF token to form data
    formData.append('_csrf', csrfToken);
    
    try {
      await onSubmit(formData, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Form submission error: ${error}`,
        severity: 'medium'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
};

export default SecureFormWrapper;
