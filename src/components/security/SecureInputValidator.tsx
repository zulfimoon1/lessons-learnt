
import React, { useState, useEffect } from 'react';

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
    const validateInput = () => {
      if (!value) {
        const result = { isValid: true, riskLevel: 'low', violations: [] };
        setValidationResult(result);
        onValidationChange(result.isValid, result.violations);
        return;
      }

      let isValid = true;
      let riskLevel = 'low';
      const violations: string[] = [];

      // Check length
      if (value.length > maxLength) {
        isValid = false;
        violations.push(`Input exceeds maximum length of ${maxLength} characters`);
      }

      // Check for SQL injection patterns
      if (/(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bexec\b|\bexecute\b)/i.test(value)) {
        isValid = false;
        riskLevel = 'high';
        violations.push('Potential SQL injection detected');
      }

      // Check for XSS patterns
      if (/<script|javascript:|on\w+\s*=/i.test(value)) {
        isValid = false;
        riskLevel = 'high';
        violations.push('Potential XSS attack detected');
      }

      // Check for path traversal
      if (/\.\.[\/\\]/.test(value)) {
        isValid = false;
        riskLevel = 'medium';
        violations.push('Path traversal attempt detected');
      }

      // Type-specific validations
      switch (inputType) {
        case 'email':
          if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
            isValid = false;
            violations.push('Invalid email format');
          }
          break;
        case 'name':
          if (/[<>"';&=]/.test(value)) {
            isValid = false;
            violations.push('Invalid characters in name field');
          }
          break;
        case 'school':
          if (/[<>"';&=]/.test(value)) {
            isValid = false;
            violations.push('Invalid characters in school field');
          }
          break;
      }

      const result: ValidationResult = {
        isValid,
        riskLevel,
        violations
      };

      setValidationResult(result);
      onValidationChange(result.isValid, result.violations);

      // Log high-risk inputs to console for monitoring
      if (riskLevel === 'high') {
        console.warn('High-risk input detected:', {
          inputType,
          violations,
          value: value.substring(0, 50) + '...'
        });
      }
    };

    // Debounce validation to avoid excessive calls
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
