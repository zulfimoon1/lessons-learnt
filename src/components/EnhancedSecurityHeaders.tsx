
import { useEffect } from 'react';

interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
  'worker-src': string[];
  'child-src': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
}

const EnhancedSecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Enhanced Content Security Policy
    const cspConfig: CSPConfig = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React development - should be removed in production
        "'unsafe-eval'", // Required for React development - should be removed in production
        "https://js.stripe.com",
        "https://checkout.stripe.com"
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS libraries
        "https://fonts.googleapis.com"
      ],
      'img-src': [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      'connect-src': [
        "'self'",
        "https://bjpgloftnlnzndgliqty.supabase.co",
        "wss://bjpgloftnlnzndgliqty.supabase.co",
        "https://api.stripe.com",
        "https://checkout.stripe.com"
      ],
      'font-src': [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com"
      ],
      'worker-src': ["'self'", "blob:"],
      'child-src': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"]
    };

    // Build CSP string
    const cspString = Object.entries(cspConfig)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    // Set enhanced security headers
    const setEnhancedSecurityHeaders = () => {
      // Content Security Policy
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.setAttribute('content', cspString);
      } else {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = cspString;
        document.head.appendChild(cspMeta);
      }

      // X-Frame-Options (Clickjacking protection)
      const existingFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!existingFrameOptions) {
        const frameMeta = document.createElement('meta');
        frameMeta.httpEquiv = 'X-Frame-Options';
        frameMeta.content = 'DENY';
        document.head.appendChild(frameMeta);
      }

      // X-Content-Type-Options (MIME type sniffing protection)
      const existingContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!existingContentType) {
        const contentTypeMeta = document.createElement('meta');
        contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
        contentTypeMeta.content = 'nosniff';
        document.head.appendChild(contentTypeMeta);
      }

      // Referrer Policy (Information leakage protection)
      const existingReferrer = document.querySelector('meta[name="referrer"]');
      if (existingReferrer) {
        existingReferrer.setAttribute('content', 'strict-origin-when-cross-origin');
      } else {
        const referrerMeta = document.createElement('meta');
        referrerMeta.name = 'referrer';
        referrerMeta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(referrerMeta);
      }

      // Permissions Policy (Feature access control)
      const existingPermissions = document.querySelector('meta[http-equiv="Permissions-Policy"]');
      if (!existingPermissions) {
        const permissionsMeta = document.createElement('meta');
        permissionsMeta.httpEquiv = 'Permissions-Policy';
        permissionsMeta.content = 'camera=(), microphone=(), geolocation=(), payment=()';
        document.head.appendChild(permissionsMeta);
      }

      // X-XSS-Protection (Legacy XSS protection)
      const existingXSS = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
      if (!existingXSS) {
        const xssMeta = document.createElement('meta');
        xssMeta.httpEquiv = 'X-XSS-Protection';
        xssMeta.content = '1; mode=block';
        document.head.appendChild(xssMeta);
      }
    };

    // Apply enhanced security headers
    setEnhancedSecurityHeaders();

    // Enhanced security event handlers
    const handleSecurityEvents = () => {
      // Disable right-click context menu in production
      const handleContextMenu = (e: MouseEvent) => {
        if (process.env.NODE_ENV === 'production') {
          e.preventDefault();
        }
      };

      // Disable developer tools shortcuts in production
      const handleKeyDown = (e: KeyboardEvent) => {
        if (process.env.NODE_ENV === 'production') {
          // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
          if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
            (e.ctrlKey && e.key === 'U')
          ) {
            e.preventDefault();
            console.warn('Developer tools access is restricted in production');
          }
        }
      };

      // Console manipulation detection
      const handleConsoleDetection = () => {
        if (process.env.NODE_ENV === 'production') {
          // Override console methods to detect tampering
          const originalLog = console.log;
          console.log = function(...args) {
            // Allow normal logging but detect suspicious patterns
            const message = args.join(' ');
            if (message.includes('password') || message.includes('token') || message.includes('secret')) {
              console.warn('Potential security information detected in console');
            }
            return originalLog.apply(console, args);
          };
        }
      };

      // Apply security event handlers
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      handleConsoleDetection();

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    };

    const cleanup = handleSecurityEvents();

    // CSP violation reporting
    const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
      console.warn('CSP Violation:', {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        documentURI: e.documentURI
      });

      // In production, you might want to report this to your security monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send violation report to security endpoint
        // fetch('/api/security/csp-violation', {
        //   method: 'POST',
        //   body: JSON.stringify({ violation: e })
        // });
      }
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Cleanup
    return () => {
      cleanup();
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default EnhancedSecurityHeaders;
