
import React, { useState, useCallback } from 'react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>) => void;
  validateFields?: Record<string, 'email' | 'password' | 'text' | 'html'>;
  rateLimitKey?: string;
  className?: string;
}

const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  validateFields = {},
  rateLimitKey,
  className
}) => {
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const handleSecureSubmit = useCallback(async (formData: Record<string, any>) => {
    setSecurityError(null);

    // Rate limiting check
    if (rateLimitKey) {
      const canProceed = enhancedSecurityService.checkRateLimit(rateLimitKey);
      if (!canProceed) {
        setIsBlocked(true);
        setSecurityError('Too many attempts. Please wait before trying again.');
        
        await enhancedSecurityService.logSecurityEvent(
          'rate_limit_exceeded',
          `Rate limit exceeded for ${rateLimitKey}`,
          'medium'
        );
        
        setTimeout(() => {
          setIsBlocked(false);
          setSecurityError(null);
        }, 60000); // 1 minute cooldown
        
        return;
      }
    }

    // Validate all form fields
    for (const [fieldName, fieldType] of Object.entries(validateFields)) {
      const fieldValue = formData[fieldName];
      
      if (fieldValue && !enhancedSecurityService.validateInput(fieldValue, fieldType)) {
        setSecurityError(`Invalid input detected in ${fieldName} field`);
        
        await enhancedSecurityService.logSecurityEvent(
          'invalid_input_detected',
          `Potentially malicious input in ${fieldName}: ${fieldValue?.substring(0, 50)}...`,
          'high'
        );
        
        toast({
          title: "Security Alert",
          description: "Invalid or potentially dangerous input detected",
          variant: "destructive"
        });
        
        return;
      }
    }

    // Sanitize inputs
    const sanitizedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitizedData[key] = enhancedSecurityService.sanitizeInput(value);
      } else {
        sanitizedData[key] = value;
      }
    }

    // Log successful validation
    await enhancedSecurityService.logSecurityEvent(
      'form_validation_passed',
      `Form submission validated successfully`,
      'low'
    );

    // Execute the original onSubmit with sanitized data
    onSubmit(sanitizedData);
  }, [onSubmit, validateFields, rateLimitKey, toast]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    handleSecureSubmit(data);
  }, [handleSecureSubmit]);

  return (
    <div className={className}>
      {securityError && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {securityError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={isBlocked ? 'opacity-50 pointer-events-none' : ''}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === 'form') {
            return React.cloneElement(child as React.ReactElement<any>, {
              onSubmit: handleFormSubmit
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default SecureFormWrapper;
