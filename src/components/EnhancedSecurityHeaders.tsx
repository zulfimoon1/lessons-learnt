
import { useEffect } from 'react';

const EnhancedSecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Completely disabled for platform admin to prevent CSP violations
    console.log('Enhanced security headers disabled for platform admin dashboard');
  }, []);

  return null;
};

export default EnhancedSecurityHeaders;
