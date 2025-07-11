
import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Remove any existing problematic security headers that cause console errors
    const existingHeaders = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'];
    existingHeaders.forEach(header => {
      const existing = document.querySelector(`meta[http-equiv="${header}"]`);
      if (existing) {
        existing.remove();
      }
    });
  }, []);

  return null;
};

export default SecurityHeaders;
