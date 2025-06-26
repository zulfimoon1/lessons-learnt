
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { enhancedSecurityValidationService } from '@/services/enhancedSecurityValidationService';
import { AlertTriangle } from 'lucide-react';

interface SecurityEnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validateAs: 'email' | 'name' | 'school' | 'grade' | 'password' | 'text';
  onSecurityValidation?: (isValid: boolean, errors: string[]) => void;
}

const SecurityEnhancedInput: React.FC<SecurityEnhancedInputProps> = ({
  validateAs,
  onSecurityValidation,
  onChange,
  value,
  className = '',
  ...props
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Perform security validation
    let validation;
    if (validateAs === 'password') {
      validation = enhancedSecurityValidationService.validatePassword(inputValue);
    } else {
      validation = enhancedSecurityValidationService.validateInput(inputValue, validateAs, {
        maxLength: validateAs === 'email' ? 254 : 100
      });
    }

    setIsValid(validation.isValid);
    setValidationErrors(validation.errors);
    
    // Notify parent component
    if (onSecurityValidation) {
      onSecurityValidation(validation.isValid, validation.errors);
    }

    // Call original onChange
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        className={`${className} ${!isValid ? 'border-red-500 focus:border-red-500' : ''}`}
      />
      {!isValid && validationErrors.length > 0 && (
        <div className="flex items-start gap-1 text-sm text-red-600">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <div>
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityEnhancedInput;
