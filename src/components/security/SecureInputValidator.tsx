
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  riskLevel: string;
  violations: string[];
}

interface SecureInputValidatorProps {
  value: string;
  inputType?: string;
  maxLength?: number;
  onValidationChange: (isValid: boolean, violations: string[]) => void;
  children: React.ReactElement;
}

const SecureInputValidator: React.FC<SecureInputValidatorProps> = ({
  value,
  inputType = 'general',
  maxLength = 1000,
  onValidationChange,
  children
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    riskLevel: 'low',
    violations: []
  });

  useEffect(() => {
    const validateInput = async () => {
      if (!value) {
        const result = { isValid: true, riskLevel: 'low', violations: [] };
        setValidationResult(result);
        onValidationChange(result.isValid, result.violations);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_secure_input', {
          input_text: value,
          input_type: inputType,
          max_length: maxLength
        });

        if (error) {
          console.error('Input validation error:', error);
          return;
        }

        const result: ValidationResult = {
          isValid: data.is_valid,
          riskLevel: data.risk_level,
          violations: data.violations || []
        };

        setValidationResult(result);
        onValidationChange(result.isValid, result.violations);

      } catch (error) {
        console.error('Input validation failed:', error);
      }
    };

    // Debounce validation to avoid excessive API calls
    const timeoutId = setTimeout(validateInput, 300);
    return () => clearTimeout(timeoutId);
  }, [value, inputType, maxLength, onValidationChange]);

  // Clone the child element and add validation styling
  const validatedChild = React.cloneElement(children, {
    className: `${children.props.className || ''} ${
      !validationResult.isValid ? 'border-red-500 bg-red-50' : ''
    } ${
      validationResult.riskLevel === 'high' ? 'border-red-600 bg-red-100' : ''
    }`.trim()
  });

  return (
    <div className="space-y-1">
      {validatedChild}
      {!validationResult.isValid && (
        <div className="space-y-1">
          {validationResult.violations.map((violation, index) => (
            <p key={index} className={`text-sm ${
              validationResult.riskLevel === 'high' ? 'text-red-700 font-medium' : 'text-red-600'
            }`}>
              {violation}
            </p>
          ))}
        </div>
      )}
      {validationResult.riskLevel === 'high' && (
        <p className="text-xs text-red-800 bg-red-100 p-2 rounded border border-red-300">
          ⚠️ High-risk input detected. This has been logged for security review.
        </p>
      )}
    </div>
  );
};

export default SecureInputValidator;
