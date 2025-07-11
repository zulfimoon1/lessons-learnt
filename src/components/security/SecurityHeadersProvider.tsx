import { useEffect } from 'react';

const SecurityHeadersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Remove security headers that cause console errors and interfere with student login
  useEffect(() => {
    // Clean up any existing security meta tags that might cause issues
    const problematicHeaders = ['Content-Security-Policy', 'X-Frame-Options'];
    problematicHeaders.forEach(header => {
      const existing = document.querySelector(`meta[http-equiv="${header}"]`);
      if (existing) {
        existing.remove();
      }
    });
  }, []);

  return <>{children}</>;
};

export default SecurityHeadersProvider;