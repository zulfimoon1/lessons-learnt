import { useEffect } from 'react';

const SecurityHeadersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Content Security Policy for enhanced security
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://meetings.hubspot.com https://js.hs-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://bjpgloftnlnzndgliqty.supabase.co https://meetings.hubspot.com wss://bjpgloftnlnzndgliqty.supabase.co",
      "frame-src 'self' https://meetings.hubspot.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
    
    document.head.appendChild(meta);

    // Additional security headers
    const securityHeaders = [
      { name: 'X-DNS-Prefetch-Control', content: 'on' },
      { name: 'X-Download-Options', content: 'noopen' },
      { name: 'X-Permitted-Cross-Domain-Policies', content: 'none' }
    ];

    securityHeaders.forEach(header => {
      const headerMeta = document.createElement('meta');
      headerMeta.httpEquiv = header.name;
      headerMeta.content = header.content;
      document.head.appendChild(headerMeta);
    });

    return () => {
      document.head.removeChild(meta);
      securityHeaders.forEach(header => {
        const existingMeta = document.querySelector(`meta[http-equiv="${header.name}"]`);
        if (existingMeta) {
          document.head.removeChild(existingMeta);
        }
      });
    };
  }, []);

  return <>{children}</>;
};

export default SecurityHeadersProvider;