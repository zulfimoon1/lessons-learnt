
import React, { ReactNode, useEffect, useState } from 'react';
import { securityValidationService } from '@/services/securityValidationService';
import { securityMonitoringService } from '@/services/securityMonitoringService';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';

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
        // Generate CSRF token if enabled
        if (enableCSRF) {
          const token = securityValidationService.generateCSRFToken();
          setCsrfToken(token);
          sessionStorage.setItem('csrf_token', token);
        }

        // Validate security headers
        securityMonitoringService.validateSecurityHeaders();

        // Set initial user agent for session security
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

    // Enhanced form validation with comprehensive security checks
    const handleFormSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const formData = new FormData(form);
      const inputs: Record<string, string> = {};
      
      // Extract form data
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          inputs[key] = value;
        }
      }

      // CSRF validation
      if (enableCSRF) {
        const formCSRF = inputs.csrf_token || form.querySelector<HTMLInputElement>('input[name="csrf_token"]')?.value;
        const sessionCSRF = sessionStorage.getItem('csrf_token');
        
        if (!formCSRF || !sessionCSRF || formCSRF !== sessionCSRF) {
          event.preventDefault();
          if (logSecurityEvents) {
            await securityValidationService.logSecurityEvent(
              'suspicious_activity',
              undefined,
              'CSRF token validation failed',
              'high'
            );
          }
          console.error('CSRF token validation failed');
          return;
        }
      }

      // Rate limiting check
      if (enableRateLimit) {
        const userIdentifier = localStorage.getItem('user_id') || 'anonymous';
        if (!securityValidationService.checkRateLimit(`form_submit:${userIdentifier}`)) {
          event.preventDefault();
          if (logSecurityEvents) {
            await securityValidationService.logSecurityEvent(
              'rate_limit_exceeded',
              userIdentifier,
              'Form submission rate limit exceeded',
              'medium'
            );
          }
          console.error('Form submission rate limit exceeded');
          return;
        }
      }

      // Comprehensive form validation
      const validationResult = await enhancedSecurityService.validateSecureForm(
        inputs, 
        form.action || window.location.pathname
      );

      if (!validationResult.isValid) {
        event.preventDefault();
        
        if (logSecurityEvents) {
          await securityValidationService.logSecurityEvent(
            'form_validation_failed',
            undefined,
            `Form validation failed: ${validationResult.errors.join(', ')}`,
            'medium'
          );
        }

        console.error('Form validation failed:', validationResult.errors);
        
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'security-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        errorDiv.textContent = 'Please check your input and try again.';
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => errorDiv.remove(), 5000);
        return;
      }

      // Check for administrative operations
      const formAction = form.action || window.location.pathname;
      if (formAction.includes('/admin') || formAction.includes('/platform')) {
        const userRole = localStorage.getItem('user_role');
        const userEmail = localStorage.getItem('user_email');
        
        if (!userEmail || !['admin', 'doctor'].includes(userRole || '')) {
          event.preventDefault();
          
          if (logSecurityEvents) {
            await securityValidationService.logSecurityEvent(
              'unauthorized_access',
              userEmail || undefined,
              `Unauthorized administrative action attempted: ${formAction}`,
              'high'
            );
          }
          
          console.error('Administrative action requires proper authorization');
          return;
        }
      }
    };

    // Enhanced input monitoring with real-time validation
    const handleInput = async (event: Event) => {
      const input = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!input || !input.value) return;

      const validation = securityValidationService.validateInput(
        input.value,
        input.name || input.id || 'unnamed_field',
        { 
          maxLength: maxInputLength,
          allowHtml: input.dataset.allowHtml === 'true',
          requireAlphanumeric: input.dataset.requireAlphanumeric === 'true'
        }
      );

      // Update input validation state
      if (!validation.isValid) {
        input.setCustomValidity(validation.errors.join(', '));
        input.classList.add('border-red-500');
      } else {
        input.setCustomValidity('');
        input.classList.remove('border-red-500');
      }

      // Log high-risk input attempts
      if (validation.riskLevel === 'high' && logSecurityEvents) {
        await securityValidationService.logSecurityEvent(
          'suspicious_activity',
          undefined,
          `High-risk input detected in field ${input.name || 'unknown'}: ${validation.errors.join(', ')}`,
          'high'
        );
      }
    };

    // Monitor for session security
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const isSecure = securityValidationService.validateSessionSecurity();
        if (!isSecure && logSecurityEvents) {
          await securityValidationService.logSecurityEvent(
            'suspicious_activity',
            undefined,
            'Session security validation failed on visibility change',
            'medium'
          );
        }
      }
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('input', handleInput);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Monitor for anomalous activity
    const monitorActivity = () => {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      securityMonitoringService.detectAnomalousActivity(userId, 'page_interaction');
    };

    const activityInterval = setInterval(monitorActivity, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('input', handleInput);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(activityInterval);
    };
  }, [maxInputLength, logSecurityEvents, enableRateLimit, enableCSRF, securityInitialized]);

  // Add CSRF token to forms automatically
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

    // Observer for dynamically added forms
    const observer = new MutationObserver(addCSRFTokenToForms);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [csrfToken, enableCSRF]);

  return <>{children}</>;
};

export default SecurityValidationWrapper;
