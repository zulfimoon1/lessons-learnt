
import { useState, useCallback } from 'react';
import { inputValidationService } from '@/services/inputValidationService';

interface UseSecureInputProps {
  initialValue?: string;
  validator?: (value: string) => boolean;
  sanitizer?: (value: string) => string;
  maxLength?: number;
}

export const useSecureInput = ({ 
  initialValue = '', 
  validator, 
  sanitizer = inputValidationService.sanitizeInput,
  maxLength = 1000 
}: UseSecureInputProps = {}) => {
  const [value, setValue] = useState(sanitizer(initialValue));
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback((newValue: string) => {
    // Sanitize input
    const sanitized = sanitizer(newValue.slice(0, maxLength));
    
    // Validate if validator provided
    if (validator && !validator(sanitized)) {
      setError('Invalid input format');
    } else {
      setError(null);
    }
    
    setValue(sanitized);
  }, [validator, sanitizer, maxLength]);

  const reset = useCallback(() => {
    setValue(sanitizer(initialValue));
    setError(null);
  }, [initialValue, sanitizer]);

  return {
    value,
    setValue: updateValue,
    error,
    reset,
    isValid: !error
  };
};
