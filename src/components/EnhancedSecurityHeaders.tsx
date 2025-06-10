
import { useEffect } from 'react';

const EnhancedSecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Generate nonce for inline scripts
    const nonce = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, byte) => 
      acc + byte.toString(16).padStart(2, '0'), ''
    );
    
    // Set enhanced Content Security Policy
    const setEnhancedSecurityHeaders = () => {
      // Remove any existing CSP meta tag
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }

      // Create enhanced CSP meta tag with nonce
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://bjpgloftnlnzndgliqty.supabase.co`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://bjpgloftnlnzndgliqty.supabase.co wss://bjpgloftnlnzndgliqty.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
        "block-all-mixed-content"
      ].join('; ');
      
      document.head.appendChild(meta);

      // Set additional enhanced security headers
      const securityMetas = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { httpEquiv: 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' },
        { httpEquiv: 'Strict-Transport-Security', content: 'max-age=31536000; includeSubDomains' }
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

    setEnhancedSecurityHeaders();

    // Enhanced XSS monitoring with threat intelligence
    const monitorForAdvancedXSS = () => {
      // Override dangerous functions with enhanced logging
      const originalEval = window.eval;
      window.eval = function(code: string) {
        console.error('CRITICAL SECURITY ALERT: eval() execution blocked');
        const event = new CustomEvent('criticalSecurityViolation', {
          detail: {
            type: 'eval_attempt',
            code: code.substring(0, 100), // Limit log size
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        });
        window.dispatchEvent(event);
        throw new Error('eval() is disabled for security reasons');
      };

      // Monitor for DOM manipulation attacks
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT') {
                const src = element.getAttribute('src');
                const content = element.textContent || '';
                
                // Block suspicious scripts
                if (!src || !src.includes('supabase.co')) {
                  console.error('SECURITY ALERT: Unauthorized script injection blocked');
                  element.remove();
                  
                  const event = new CustomEvent('criticalSecurityViolation', {
                    detail: {
                      type: 'script_injection',
                      src: src,
                      content: content.substring(0, 100),
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent
                    }
                  });
                  window.dispatchEvent(event);
                }
              }
              
              // Check for iframe injections
              if (element.tagName === 'IFRAME') {
                const src = element.getAttribute('src');
                if (src && !src.startsWith(window.location.origin)) {
                  console.error('SECURITY ALERT: Unauthorized iframe injection blocked');
                  element.remove();
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'href', 'onclick', 'onerror', 'onload']
      });

      return () => observer.disconnect();
    };

    const cleanup = monitorForAdvancedXSS();

    // Add CSRF token to all forms
    const addCSRFProtection = () => {
      const csrfToken = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, byte) => 
        acc + byte.toString(16).padStart(2, '0'), ''
      );
      
      sessionStorage.setItem('csrf_token', csrfToken);
      
      // Add CSRF token to all forms
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        let csrfInput = form.querySelector('input[name="csrf_token"]') as HTMLInputElement;
        if (!csrfInput) {
          csrfInput = document.createElement('input');
          csrfInput.type = 'hidden';
          csrfInput.name = 'csrf_token';
          form.appendChild(csrfInput);
        }
        csrfInput.value = csrfToken;
      });
    };

    addCSRFProtection();

    return () => {
      cleanup();
    };
  }, []);

  return null;
};

export default EnhancedSecurityHeaders;
