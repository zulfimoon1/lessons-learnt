
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { useSecureInput } from '@/hooks/useSecureInput';
import { inputValidationService } from '@/services/inputValidationService';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 'email' | 'name' | 'school' | 'text' | 'search';
  onSecureChange?: (value: string, isValid: boolean) => void;
  maxLength?: number;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ validationType = 'text', onSecureChange, maxLength = 1000, onChange, ...props }, ref) => {
    const getValidator = (type: string) => {
      switch (type) {
        case 'email':
          return inputValidationService.validateEmail;
        case 'name':
          return inputValidationService.validatePersonName;
        case 'school':
          return inputValidationService.validateSchoolName;
        case 'search':
          return (value: string) => inputValidationService.sanitizeSearchQuery(value) === value;
        default:
          return (value: string) => inputValidationService.validateTextContent(value, maxLength);
      }
    };

    const getSanitizer = (type: string) => {
      if (type === 'search') {
        return inputValidationService.sanitizeSearchQuery;
      }
      return inputValidationService.sanitizeInput;
    };

    const { value, setValue, error, isValid } = useSecureInput({
      initialValue: props.defaultValue?.toString() || '',
      validator: getValidator(validationType),
      sanitizer: getSanitizer(validationType),
      maxLength
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      if (onSecureChange) {
        onSecureChange(newValue, isValid);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={handleChange}
          className={`${props.className || ''} ${error ? 'border-red-500' : ''}`}
          maxLength={maxLength}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';
