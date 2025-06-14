
import React from 'react';
import { enhancedSecurityService, PasswordValidationResult } from '@/services/enhancedSecurityService';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className = '' 
}) => {
  const validation = enhancedSecurityService.validatePassword(password);

  const getStrengthColor = (strength: PasswordValidationResult['strength']) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (strength: PasswordValidationResult['strength']) => {
    switch (strength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password Strength:</span>
        <span className={`text-sm font-medium ${
          validation.strength === 'strong' ? 'text-green-600' :
          validation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.strength)} ${getStrengthWidth(validation.strength)}`}
        />
      </div>
      
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2" />
              {error}
            </p>
          ))}
        </div>
      )}
      
      {validation.isValid && (
        <p className="text-xs text-green-600 flex items-center">
          <span className="w-1 h-1 bg-green-600 rounded-full mr-2" />
          Password meets all requirements
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
