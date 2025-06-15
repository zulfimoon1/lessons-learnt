
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { securityValidationService } from '@/services/securityValidationService';

interface SecurityEnhancedInputProps {
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  maxLength?: number;
  validateAs?: 'email' | 'password' | 'name' | 'school' | 'grade' | 'text';
}

const SecurityEnhancedInput: React.FC<SecurityEnhancedInputProps> = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  maxLength = 1000,
  validateAs = 'text'
}) => {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    errors: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }>({
    isValid: true,
    errors: [],
    riskLevel: 'low'
  });

  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  useEffect(() => {
    if (!value) {
      setValidationState({ isValid: true, errors: [], riskLevel: 'low' });
      return;
    }

    // Real-time validation
    const validation = securityValidationService.validateInput(value, name, {
      maxLength,
      allowHtml: false,
      requireAlphanumeric: ['name', 'school', 'grade'].includes(validateAs)
    });

    setValidationState(validation);

    // Check rate limiting for rapid input
    const rateLimitKey = `input_${name}_${Date.now()}`;
    const isRateLimited = !securityValidationService.checkRateLimit(rateLimitKey, 50, 60000);
    setRateLimitWarning(isRateLimited);

  }, [value, name, maxLength, validateAs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const getInputClassName = () => {
    let baseClass = className;
    
    if (!validationState.isValid) {
      baseClass += ' border-red-500 focus:border-red-500';
    } else if (validationState.riskLevel === 'medium') {
      baseClass += ' border-yellow-500 focus:border-yellow-500';
    }

    if (rateLimitWarning) {
      baseClass += ' border-orange-500';
    }

    return baseClass;
  };

  return (
    <div className="space-y-1">
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        className={getInputClassName()}
        maxLength={maxLength}
      />
      {!validationState.isValid && (
        <div className="text-xs text-red-600">
          {validationState.errors.join(', ')}
        </div>
      )}
      {rateLimitWarning && (
        <div className="text-xs text-orange-600">
          Please slow down your typing
        </div>
      )}
      {validationState.riskLevel === 'high' && (
        <div className="text-xs text-red-600 font-semibold">
          Potentially dangerous content detected
        </div>
      )}
    </div>
  );
};

export default SecurityEnhancedInput;
