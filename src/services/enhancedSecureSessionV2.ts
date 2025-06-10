
import { enhancedSecureSessionService } from './enhancedSecureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

interface SecureSessionConfig {
  useHttpOnlyCookies: boolean;
  enableStrictSameSite: boolean;
  enhancedFingerprinting: boolean;
  sessionTimeout: number; // in milliseconds
}

interface EnhancedFingerprint {
  basic: {
    userAgent: string;
    language: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    colorDepth: number;
  };
  advanced: {
    cookiesEnabled: boolean;
    javaEnabled: boolean;
    plugins: string[];
    mimeTypes: string[];
    touchSupport: boolean;
    hardwareConcurrency: number;
    deviceMemory?: number;
    connection?: string;
  };
  canvas: string;
  webgl: string;
  audio: string;
}

class EnhancedSecureSessionV2 {
  private config: SecureSessionConfig = {
    useHttpOnlyCookies: false, // Would require server-side implementation
    enableStrictSameSite: true,
    enhancedFingerprinting: true,
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  };

  // Generate comprehensive browser fingerprint
  private generateEnhancedFingerprint(): EnhancedFingerprint {
    // Basic fingerprinting
    const basic = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth
    };

    // Advanced fingerprinting
    const advanced = {
      cookiesEnabled: navigator.cookieEnabled,
      javaEnabled: typeof (navigator as any).javaEnabled === 'function' ? (navigator as any).javaEnabled() : false,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      mimeTypes: Array.from(navigator.mimeTypes).map(m => m.type),
      touchSupport: 'ontouchstart' in window,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection?.effectiveType
    };

    // Canvas fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasFingerprint = '';
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#f60';
      ctx.fillText('Enhanced Security 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint Canvas', 4, 45);
      canvasFingerprint = canvas.toDataURL();
    }

    // WebGL fingerprinting
    let webglFingerprint = '';
    try {
      const webglCanvas = document.createElement('canvas');
      const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglFingerprint = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + '~' + 
                            gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {
      webglFingerprint = 'unavailable';
    }

    // Audio fingerprinting
    let audioFingerprint = '';
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.value = 10000;
      gainNode.gain.value = 0;
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      audioFingerprint = Array.from(frequencyData.slice(0, 30)).join(',');
      
      audioCtx.close();
    } catch (e) {
      audioFingerprint = 'unavailable';
    }

    return {
      basic,
      advanced,
      canvas: canvasFingerprint,
      webgl: webglFingerprint,
      audio: audioFingerprint
    };
  }

  // Enhanced fingerprint validation with weighted scoring
  private validateEnhancedFingerprint(stored: EnhancedFingerprint, current: EnhancedFingerprint): number {
    let score = 0;
    let totalWeight = 0;

    // Basic fingerprint validation (high weight)
    const basicWeight = 5;
    if (stored.basic.userAgent === current.basic.userAgent) score += 3 * basicWeight;
    if (stored.basic.platform === current.basic.platform) score += 2 * basicWeight;
    if (stored.basic.language === current.basic.language) score += 1 * basicWeight;
    if (stored.basic.screenResolution === current.basic.screenResolution) score += 1 * basicWeight;
    if (stored.basic.timezone === current.basic.timezone) score += 1 * basicWeight;
    if (stored.basic.colorDepth === current.basic.colorDepth) score += 1 * basicWeight;
    totalWeight += 9 * basicWeight;

    // Advanced fingerprint validation (medium weight)
    const advancedWeight = 3;
    if (stored.advanced.cookiesEnabled === current.advanced.cookiesEnabled) score += 1 * advancedWeight;
    if (stored.advanced.javaEnabled === current.advanced.javaEnabled) score += 1 * advancedWeight;
    if (stored.advanced.touchSupport === current.advanced.touchSupport) score += 1 * advancedWeight;
    if (stored.advanced.hardwareConcurrency === current.advanced.hardwareConcurrency) score += 2 * advancedWeight;
    totalWeight += 5 * advancedWeight;

    // Canvas fingerprint validation (high weight)
    const canvasWeight = 4;
    if (stored.canvas === current.canvas) score += 3 * canvasWeight;
    totalWeight += 3 * canvasWeight;

    // WebGL fingerprint validation (medium weight)
    const webglWeight = 2;
    if (stored.webgl === current.webgl && stored.webgl !== 'unavailable') score += 2 * webglWeight;
    totalWeight += 2 * webglWeight;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // Session security validation
  async validateSessionSecurity(sessionId: string): Promise<{
    valid: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    issues: string[];
  }> {
    try {
      const session = await enhancedSecureSessionService.getSession();
      if (!session || session.sessionId !== sessionId) {
        return {
          valid: false,
          riskLevel: 'high',
          issues: ['Session not found or ID mismatch']
        };
      }

      const issues: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Check session age
      const sessionAge = Date.now() - new Date(session.createdAt).getTime();
      if (sessionAge > this.config.sessionTimeout) {
        issues.push('Session has exceeded maximum age');
        riskLevel = 'high';
      }

      // Check fingerprint if enhanced fingerprinting is enabled
      if (this.config.enhancedFingerprinting) {
        const currentFingerprint = this.generateEnhancedFingerprint();
        const storedFingerprint = session.fingerprint as any;
        
        if (storedFingerprint) {
          const fingerprintScore = this.validateEnhancedFingerprint(storedFingerprint, currentFingerprint);
          if (fingerprintScore < 0.7) {
            issues.push(`Enhanced fingerprint validation failed (score: ${fingerprintScore.toFixed(2)})`);
            riskLevel = fingerprintScore < 0.4 ? 'high' : 'medium';
          }
        }
      }

      // Check for suspicious activity patterns
      await enhancedSecureSessionService.detectSuspiciousActivity();

      logUserSecurityEvent({
        type: 'session_validation',
        userId: session.userId,
        timestamp: new Date().toISOString(),
        details: `Session security validation: ${issues.length} issues found, risk level: ${riskLevel}`,
        userAgent: navigator.userAgent,
        sessionId: session.sessionId
      });

      return {
        valid: issues.length === 0,
        riskLevel,
        issues
      };
    } catch (error) {
      logUserSecurityEvent({
        type: 'session_error',
        timestamp: new Date().toISOString(),
        details: `Session security validation failed: ${error}`,
        userAgent: navigator.userAgent
      });

      return {
        valid: false,
        riskLevel: 'high',
        issues: ['Session validation error']
      };
    }
  }

  // Security headers validation
  validateSecurityHeaders(): {
    compliant: boolean;
    missing: string[];
    recommendations: string[];
  } {
    const missing: string[] = [];
    const recommendations: string[] = [];

    // Check for security headers (these would normally be checked server-side)
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Content-Security-Policy'
    ];

    // In a real implementation, these would be checked from response headers
    // For now, we'll check if our SecurityHeaders component is implementing them
    const hasSecurityHeaders = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    
    if (!hasSecurityHeaders) {
      missing.push('Security meta tags not fully implemented');
      recommendations.push('Ensure SecurityHeaders component is properly loaded');
    }

    recommendations.push(
      'Implement server-side security headers for maximum protection',
      'Consider implementing HTTP-only cookies for session management',
      'Enable HSTS (HTTP Strict Transport Security) headers',
      'Implement CSP nonces for script execution'
    );

    return {
      compliant: missing.length === 0,
      missing,
      recommendations
    };
  }
}

export const enhancedSecureSessionV2 = new EnhancedSecureSessionV2();
