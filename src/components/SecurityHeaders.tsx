
import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set security-related meta tags and headers
    const setSecurityHeaders = () => {
      // Content Security Policy (basic implementation)
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://bjpgloftnlnzndgliqty.supabase.co wss://bjpgloftnlnzndgliqty.supabase.co; font-src 'self' data:;";
      
      // Check if CSP meta tag already exists
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!existingCSP) {
        document.head.appendChild(cspMeta);
      }

      // X-Frame-Options
      const frameMeta = document.createElement('meta');
      frameMeta.httpEquiv = 'X-Frame-Options';
      frameMeta.content = 'DENY';
      
      const existingFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!existingFrame) {
        document.head.appendChild(frameMeta);
      }

      // X-Content-Type-Options
      const contentTypeMeta = document.createElement('meta');
      contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
      contentTypeMeta.content = 'nosniff';
      
      const existingContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!existingContentType) {
        document.head.appendChild(contentTypeMeta);
      }

      // Referrer Policy
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      
      const existingReferrer = document.querySelector('meta[name="referrer"]');
      if (!existingReferrer) {
        document.head.appendChild(referrerMeta);
      }
    };

    // Apply security headers
    setSecurityHeaders();

    // Disable right-click context menu in production
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Disable F12 and other dev tools shortcuts in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;
