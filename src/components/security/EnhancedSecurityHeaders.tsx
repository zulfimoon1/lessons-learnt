
import { useEffect } from 'react';

interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
}

const EnhancedSecurityHeaders: React.FC = () => {
  useEffect(() => {
    const setSecurityHeaders = () => {
      // Content Security Policy
      const cspDirectives: CSPDirectives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'img-src': ["'self'", "data:", "https:", "blob:"],
        'connect-src': ["'self'", "https://api.stripe.com", "https://*.supabase.co", "wss://*.supabase.co"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'object-src': ["'none'"],
        'media-src': ["'self'"],
        'frame-src': ["'self'", "https://js.stripe.com"]
      };

      const cspString = Object.entries(cspDirectives)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');

      // Enhanced security headers
      const securityHeaders = [
        { httpEquiv: 'Content-Security-Policy', content: cspString },
        { httpEquiv: 'X-Frame-Options', content: 'SAMEORIGIN' },
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
        { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
      ];

      // Remove existing security headers to prevent conflicts
      const existingHeaders = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"], meta[http-equiv*="X-Frame-Options"], meta[http-equiv*="X-Content-Type-Options"]');
      existingHeaders.forEach(header => header.remove());

      // Apply new headers
      securityHeaders.forEach(({ httpEquiv, content }) => {
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = httpEquiv;
        metaTag.content = content;
        document.head.appendChild(metaTag);
      });

      console.log('🔒 Enhanced security headers applied');
    };

    setSecurityHeaders();

    // Apply HSTS header simulation (would be set by server in production)
    if (location.protocol === 'https:') {
      console.log('🔒 HTTPS detected - HSTS would be active in production');
    }
  }, []);

  return null;
};

export default EnhancedSecurityHeaders;
