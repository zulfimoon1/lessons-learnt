
import React, { ReactNode, useEffect, useState } from 'react';

interface SecurityValidationWrapperProps {
  children: ReactNode;
  validationRules?: {
    maxInputLength?: number;
    enableRateLimit?: boolean;
    logSecurityEvents?: boolean;
    enableCSRF?: boolean;
  };
}

const SecurityValidationWrapper: React.FC<SecurityValidationWrapperProps> = ({ 
  children, 
  validationRules = {} 
}) => {
  const {
    maxInputLength = 1000,
    enableRateLimit = true,
    logSecurityEvents = true,
    enableCSRF = true
  } = validationRules;

  const [csrfToken, setCsrfToken] = useState<string>('');
  const [securityInitialized, setSecurityInitialized] = useState(false);

  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        if (enableCSRF) {
          const token = crypto.randomUUID();
          setCsrfToken(token);
          sessionStorage.setItem('csrf_token', token);
        }

        if (!sessionStorage.getItem('initial_user_agent')) {
          sessionStorage.setItem('initial_user_agent', navigator.userAgent);
        }

        setSecurityInitialized(true);
      } catch (error) {
        console.error('Security initialization failed:', error);
      }
    };

    initializeSecurity();
  }, [enableCSRF]);

  useEffect(() => {
    if (!securityInitialized) return;

    const handleFormSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const formData = new FormData(form);
      const inputs: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          inputs[key] = value;
        }
      }

      // Basic validation
      for (const [key, value] of Object.entries(inputs)) {
        if (value.length > maxInputLength) {
          event.preventDefault();
          console.error(`Input ${key} exceeds maximum length`);
          return;
        }
      }
    };

    const handleInput = async (event: Event) => {
      const input = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!input || !input.value) return;

      if (input.value.length > maxInputLength) {
        input.setCustomValidity(`Maximum length is ${maxInputLength} characters`);
        input.classList.add('border-red-500');
      } else {
        input.setCustomValidity('');
        input.classList.remove('border-red-500');
      }
    };

    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('input', handleInput);
    };
  }, [maxInputLength, logSecurityEvents, enableRateLimit, enableCSRF, securityInitialized]);

  useEffect(() => {
    if (!enableCSRF || !csrfToken) return;

    const addCSRFTokenToForms = () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (!form.querySelector('input[name="csrf_token"]')) {
          const csrfInput = document.createElement('input');
          csrfInput.type = 'hidden';
          csrfInput.name = 'csrf_token';
          csrfInput.value = csrfToken;
          form.appendChild(csrfInput);
        }
      });
    };

    addCSRFTokenToForms();

    const observer = new MutationObserver(addCSRFTokenToForms);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [csrfToken, enableCSRF]);

  return <>{children}</>;
};

export default SecurityValidationWrapper;
