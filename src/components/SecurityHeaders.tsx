
import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set Content Security Policy via meta tag (simplified for platform admin)
    const setSecurityHeaders = () => {
      // Remove any existing CSP meta tag
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }

      // Create new CSP meta tag with relaxed policies for platform admin
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://bjpgloftnlnzndgliqty.supabase.co",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://bjpgloftnlnzndgliqty.supabase.co wss://bjpgloftnlnzndgliqty.supabase.co",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');
      
      document.head.appendChild(meta);

      // Set additional security headers via meta tags where possible
      const securityMetas = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'SAMEORIGIN' }, // Changed from DENY to SAMEORIGIN
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
      ];

      securityMetas.forEach(({ httpEquiv, content }) => {
        const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (existing) {
          existing.remove();
        }
        
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = httpEquiv;
        metaTag.content = content;
        document.head.appendChild(metaTag);
      });
    };

    setSecurityHeaders();

    // Removed aggressive XSS monitoring that was causing false positives
  }, []);

  return null; // This component doesn't render anything visible
};

export default SecurityHeaders;
