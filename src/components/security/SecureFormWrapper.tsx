
import React, { ReactNode, useEffect } from 'react';
import { securityValidationService } from '@/services/securityValidationService';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface SecureFormWrapperProps {
  children: ReactNode;
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>;
  className?: string;
}

const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({ 
  children, 
  onSubmit, 
  className = "" 
}) => {
  const { csrfToken } = useSecureAuth();

  const handleSecureSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Add CSRF token
    formData.append('csrf_token', csrfToken);
    
    try {
      // Validate all form inputs
      const inputs = Array.from(form.elements).filter(
        element => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ) as (HTMLInputElement | HTMLTextAreaElement)[];

      for (const input of inputs) {
        if (input.name && input.value) {
          const validation = securityValidationService.validateInput(
            input.value,
            input.name,
            {
              maxLength: input.name === 'email' ? 254 : 1000,
              allowHtml: false,
              requireAlphanumeric: ['name', 'school', 'grade'].includes(input.name)
            }
          );

          if (!validation.isValid) {
            throw new Error(`Invalid ${input.name}: ${validation.errors.join(', ')}`);
          }
        }
      }

      await onSubmit(formData, csrfToken);
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Add input validation listeners
    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!input.value) return;

      const validation = securityValidationService.validateInput(
        input.value,
        input.name || 'field',
        { maxLength: 1000, allowHtml: false }
      );

      if (!validation.isValid) {
        input.setCustomValidity(validation.errors.join(', '));
        input.classList.add('border-red-500');
      } else {
        input.setCustomValidity('');
        input.classList.remove('border-red-500');
      }
    };

    document.addEventListener('input', handleInput);
    return () => document.removeEventListener('input', handleInput);
  }, []);

  return (
    <form onSubmit={handleSecureSubmit} className={className}>
      {children}
      <input type="hidden" name="csrf_token" value={csrfToken} />
    </form>
  );
};

export default SecureFormWrapper;
