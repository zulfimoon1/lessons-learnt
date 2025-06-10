
import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set Content Security Policy via meta tag (fallback for environments without server control)
    const setSecurityHeaders = () => {
      // Remove any existing CSP meta tag
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }

      // Create new CSP meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://bjpgloftnlnzndgliqty.supabase.co",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://bjpgloftnlnzndgliqty.supabase.co wss://bjpgloftnlnzndgliqty.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');
      
      document.head.appendChild(meta);

      // Set additional security headers via meta tags where possible
      const securityMetas = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
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

    // Monitor for potential XSS attempts
    const monitorForXSS = () => {
      // Override dangerous functions to log attempts
      const originalEval = window.eval;
      window.eval = function(code: string) {
        console.warn('Security Alert: eval() called with:', code);
        // Log security event
        const event = new CustomEvent('securityViolation', {
          detail: {
            type: 'eval_attempt',
            code: code,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
        window.dispatchEvent(event);
        return originalEval.call(this, code);
      };

      // Monitor for inline script injection attempts
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT' && !element.getAttribute('src')) {
                console.warn('Security Alert: Inline script detected');
                const event = new CustomEvent('securityViolation', {
                  detail: {
                    type: 'inline_script',
                    content: element.textContent,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                  }
                });
                window.dispatchEvent(event);
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    };

    const cleanup = monitorForXSS();

    return () => {
      cleanup();
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default SecurityHeaders;
