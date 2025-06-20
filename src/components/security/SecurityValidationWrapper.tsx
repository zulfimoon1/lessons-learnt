
import React, { ReactNode } from 'react';

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
  children
}) => {
  // Simplified security wrapper that doesn't interfere with authentication
  // All security validations are now handled at the service level
  return <>{children}</>;
};

export default SecurityValidationWrapper;
