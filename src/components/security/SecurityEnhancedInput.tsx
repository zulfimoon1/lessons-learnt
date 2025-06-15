
import React from 'react';
import { Input } from '@/components/ui/input';
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';

interface SecurityEnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validateAs?: 'email' | 'password' | 'name' | 'school' | 'grade' | 'text';
  maxLength?: number;
}

const SecurityEnhancedInput: React.FC<SecurityEnhancedInputProps> = ({
  validateAs = 'text',
  maxLength = 255,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Basic input validation based on type
    const validation = enhancedSecurityValidationService.validateInput(
      value,
      validateAs,
      { 
        maxLength,
        allowHtml: false,
        requireAlphanumeric: validateAs === 'name' || validateAs === 'school'
      }
    );

    // Log high-risk inputs
    if (validation.riskLevel === 'high') {
      enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        details: `High-risk input detected in ${validateAs} field`,
        severity: 'medium'
      });
    }

    // Still call the original onChange
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <Input
      {...props}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
};

export default SecurityEnhancedInput;
