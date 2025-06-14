
import React, { ReactNode } from 'react';
import { securityValidationService } from '@/services/securityValidationService';

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
    };

    // Add event listener for form submissions
    document.addEventListener('submit', handleFormSubmit);

    // Cleanup
    return () => {
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [maxInputLength, logSecurityEvents]);

  return <>{children}</>;
};

export default SecurityValidationWrapper;
