
import React, { ReactNode } from 'react';
import { securityValidationService } from '@/services/securityValidationService';
import { securityPatchService } from '@/services/securityPatchService';

interface SecurityValidationWrapperProps {
  children: ReactNode;
  validationRules?: {
    maxInputLength?: number;
    enableRateLimit?: boolean;
    logSecurityEvents?: boolean;
  };
}

const SecurityValidationWrapper: React.FC<SecurityValidationWrapperProps> = ({ 
  children, 
  validationRules = {} 
}) => {
  const {
    maxInputLength = 1000,
    enableRateLimit = true,
    logSecurityEvents = true
  } = validationRules;

  React.useEffect(() => {
    // Add global input validation listener
    const handleFormSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const formData = new FormData(form);
      const inputs: { [key: string]: string } = {};
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          inputs[key] = value;
        }
      }

      // Validate all form inputs
      for (const [fieldName, fieldValue] of Object.entries(inputs)) {
        const validation = securityValidationService.validateInput(
          fieldValue, 
          fieldName,
          { maxLength: maxInputLength }
        );

        if (!validation.isValid) {
          event.preventDefault();
          
          if (logSecurityEvents) {
            await securityValidationService.logSecurityEvent(
              'form_validation_failed',
              `Field: ${fieldName}, Errors: ${validation.errors.join(', ')}`,
              'medium'
            );
          }

          console.error(`Form validation failed for field ${fieldName}:`, validation.errors);
          return;
        }
      }

      // Additional security check for sensitive operations
      const formAction = form.action || window.location.pathname;
      if (formAction.includes('/admin') || formAction.includes('/platform')) {
        const userEmail = localStorage.getItem('platform_admin') ? 
          JSON.parse(localStorage.getItem('platform_admin') || '{}').email : null;
        
        if (!userEmail) {
          event.preventDefault();
          console.error('Administrative action requires authentication');
          return;
        }
      }
    };

    // Enhanced input monitoring for XSS prevention
    const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input || !input.value) return;

      const validation = securityValidationService.validateInput(
        input.value,
        input.name || 'unnamed_field',
        { maxLength: maxInputLength }
      );

      if (!validation.isValid) {
        input.setCustomValidity(validation.errors.join(', '));
      } else {
        input.setCustomValidity('');
      }
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('input', handleInput);

    // Cleanup
    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('input', handleInput);
    };
  }, [maxInputLength, logSecurityEvents]);

  return <>{children}</>;
};

export default SecurityValidationWrapper;
