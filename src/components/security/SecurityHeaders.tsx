
import { useEffect } from 'react';

const SecurityHeaders = () => {
  useEffect(() => {
    // Set comprehensive security headers
    const setSecurityHeaders = () => {
      // Content Security Policy - more restrictive
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
          "frame-src https://js.stripe.com https://hooks.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ');
        document.head.appendChild(meta);
      }

      // Strict Transport Security
      const stsMeta = document.querySelector('meta[http-equiv="Strict-Transport-Security"]');
      if (!stsMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Strict-Transport-Security';
        meta.content = 'max-age=31536000; includeSubDomains; preload';
        document.head.appendChild(meta);
      }

      // X-Frame-Options
      const frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!frameMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-Frame-Options';
        meta.content = 'DENY';
        document.head.appendChild(meta);
      }

      // X-Content-Type-Options
      const contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-Content-Type-Options';
        meta.content = 'nosniff';
        document.head.appendChild(meta);
      }

      // X-XSS-Protection
      const xssMeta = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
      if (!xssMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-XSS-Protection';
        meta.content = '1; mode=block';
        document.head.appendChild(meta);
      }

      // Referrer Policy
      const referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        const meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(meta);
      }

      // Permissions Policy - more restrictive
      const permissionsMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]');
      if (!permissionsMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Permissions-Policy';
        meta.content = [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'interest-cohort=()',
          'payment=()',
          'usb=()',
          'bluetooth=()',
          'magnetometer=()',
          'gyroscope=()',
          'accelerometer=()'
        ].join(', ');
        document.head.appendChild(meta);
      }

      // Feature Policy fallback for older browsers
      const featureMeta = document.querySelector('meta[http-equiv="Feature-Policy"]');
      if (!featureMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Feature-Policy';
        meta.content = [
          "camera 'none'",
          "microphone 'none'",
          "geolocation 'none'",
          "payment 'none'"
        ].join('; ');
        document.head.appendChild(meta);
      }
    };

    setSecurityHeaders();

    // Monitor for any attempts to modify security headers
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLMetaElement && 
                (node.httpEquiv?.includes('Content-Security-Policy') ||
                 node.httpEquiv?.includes('X-Frame-Options') ||
                 node.httpEquiv?.includes('X-Content-Type-Options'))) {
              console.warn('Security header removal detected, re-applying...');
              setSecurityHeaders();
            }
          });
        }
      });
    });

    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default SecurityHeaders;
