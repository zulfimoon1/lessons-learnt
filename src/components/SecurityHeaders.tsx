
import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Minimal security headers for platform admin - no CSP violations
    const setMinimalSecurityHeaders = () => {
      // Remove any existing problematic security headers
      const existingHeaders = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'];
      existingHeaders.forEach(header => {
        const existing = document.querySelector(`meta[http-equiv="${header}"]`);
        if (existing) {
          existing.remove();
        }
      });

      // Set only essential, non-conflicting headers
      const securityMetas = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
      ];

      securityMetas.forEach(({ httpEquiv, content }) => {
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = httpEquiv;
        metaTag.content = content;
        document.head.appendChild(metaTag);
      });
    };

    setMinimalSecurityHeaders();
  }, []);

  return null;
};

export default SecurityHeaders;
