
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SecureInputValidator from './SecureInputValidator';

interface FormValidationState {
  [key: string]: {
    isValid: boolean;
    violations: string[];
  };
}

interface SecureFormValidationProps {
  children: React.ReactElement;
  onValidationChange?: (isFormValid: boolean, fieldErrors: Record<string, string[]>) => void;
  enableRealTimeValidation?: boolean;
}

const SecureFormValidation: React.FC<SecureFormValidationProps> = ({
  children,
  onValidationChange,
  enableRealTimeValidation = true
}) => {
  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Generate CSRF token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const handleFieldValidation = (fieldName: string, isValid: boolean, violations: string[]) => {
    setValidationState(prev => {
      const newState = {
        ...prev,
        [fieldName]: { isValid, violations }
      };

      // Check if entire form is valid
      const isFormValid = Object.values(newState).every(field => field.isValid);
      const fieldErrors = Object.fromEntries(
        Object.entries(newState)
          .filter(([_, field]) => !field.isValid)
          .map(([name, field]) => [name, field.violations])
      );

      if (onValidationChange) {
        onValidationChange(isFormValid, fieldErrors);
      }

      return newState;
    });
  };

  const enhanceFormElement = (element: React.ReactElement): React.ReactElement => {
    if (element.type === 'input' || element.type === 'textarea') {
      const { name, type, value = '', maxLength = 1000 } = element.props;
      
      if (!name) return element;

      const inputType = type === 'email' ? 'email' : 
                      name.toLowerCase().includes('name') ? 'name' :
                      name.toLowerCase().includes('school') ? 'school' : 'general';

      return (
        <SecureInputValidator
          key={name}
          value={value}
          inputType={inputType}
          maxLength={maxLength}
          onValidationChange={(isValid, violations) => 
            handleFieldValidation(name, isValid, violations)
          }
        >
          {element}
        </SecureInputValidator>
      );
    }

    if (element.props?.children) {
      return React.cloneElement(element, {
        children: React.Children.map(element.props.children, (child) => {
          if (React.isValidElement(child)) {
            return enhanceFormElement(child);
          }
          return child;
        })
      });
    }

    return element;
  };

  const handleFormSubmit = async (originalHandler: (e: React.FormEvent) => void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate CSRF token
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!csrfToken || csrfToken !== storedToken) {
        console.error('CSRF token validation failed');
        return;
      }

      // Check if form is valid
      const isFormValid = Object.values(validationState).every(field => field.isValid);
      if (!isFormValid) {
        console.error('Form validation failed');
        return;
      }

      // Basic rate limiting check using existing function
      try {
        const rateLimitOk = await supabase.rpc('check_rate_limit', {
          user_id: 'form_submission',
          operation: 'form_submit',
          max_attempts: 10,
          window_minutes: 5
        });

        if (!rateLimitOk.data) {
          console.error('Rate limit exceeded for form submission');
          return;
        }
      } catch (error) {
        console.warn('Rate limit check failed, proceeding with form submission');
      }

      // Call original handler
      await originalHandler(e);
    };
  };

  const enhancedForm = React.cloneElement(children, {
    onSubmit: children.props.onSubmit ? handleFormSubmit(children.props.onSubmit) : undefined,
    children: [
      // Add CSRF token as hidden input
      <input key="csrf" type="hidden" name="csrf_token" value={csrfToken} />,
      // Enhance all form children
      ...React.Children.map(children.props.children, (child) => {
        if (React.isValidElement(child)) {
          return enhanceFormElement(child);
        }
        return child;
      })
    ]
  });

  return enhancedForm;
};

export default SecureFormValidation;
