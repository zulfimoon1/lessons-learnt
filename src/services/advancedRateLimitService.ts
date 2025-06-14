
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

interface GeoLocation {
  country?: string;
  region?: string;
  suspicious: boolean;
}

class AdvancedRateLimitService {
  private ipAttempts = new Map<string, RateLimitEntry>();
  private suspiciousIPs = new Set<string>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MINUTES = 15;
  private readonly LOCKOUT_MINUTES = 30;
  private readonly MAX_DAILY_ATTEMPTS = 50;

  // Simulate IP geolocation (in production, use a real service)
  private async getGeoLocation(ip: string): Promise<GeoLocation> {
    // Simulate suspicious patterns
    const suspiciousPatterns = [
      /^10\./, // Private IP attempting external access
      /^192\.168\./, // Private IP patterns
      /^172\.(1[6-9]|2[0-9]|3[01])\./ // Private IP ranges
    ];

    const suspicious = suspiciousPatterns.some(pattern => pattern.test(ip));
    
    return {
      country: 'Unknown',
      region: 'Unknown',
      suspicious
    };
  }

  private getClientIP(): string {
    // In a real application, this would come from headers set by a reverse proxy
    // For demo purposes, we'll generate a consistent IP based on browser fingerprint
    const fingerprint = navigator.userAgent + screen.width + screen.height;
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Convert to IP-like format
    const a = Math.abs(hash) % 256;
    const b = Math.abs(hash >> 8) % 256;
    const c = Math.abs(hash >> 16) % 256;
    const d = Math.abs(hash >> 24) % 256;
    
    return `${a}.${b}.${c}.${d}`;
  }

  async checkRateLimit(identifier: string, action: string = 'login'): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockoutUntil?: number;
    suspiciousActivity: boolean;
    message?: string;
  }> {
    const ip = this.getClientIP();
    const now = Date.now();
    const windowStart = now - (this.WINDOW_MINUTES * 60 * 1000);

    // Check IP-based rate limiting
    let ipEntry = this.ipAttempts.get(ip);
    if (!ipEntry) {
      ipEntry = { attempts: 0, firstAttempt: now, lastAttempt: now };
      this.ipAttempts.set(ip, ipEntry);
    }

    // Clean old attempts
    if (ipEntry.firstAttempt < windowStart) {
      ipEntry.attempts = 0;
      ipEntry.firstAttempt = now;
    }

    // Check if IP is locked out
    if (ipEntry.lockoutUntil && now < ipEntry.lockoutUntil) {
      const minutes = Math.ceil((ipEntry.lockoutUntil - now) / (1000 * 60));
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil: ipEntry.lockoutUntil,
        suspiciousActivity: true,
        message: `IP locked out for ${minutes} minutes`
      };
    }

    // Check geolocation
    const geoInfo = await this.getGeoLocation(ip);
    if (geoInfo.suspicious) {
      this.suspiciousIPs.add(ip);
    }

    const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - ipEntry.attempts);
    const suspiciousActivity = this.suspiciousIPs.has(ip) || ipEntry.attempts > this.MAX_ATTEMPTS / 2;

    return {
      allowed: ipEntry.attempts < this.MAX_ATTEMPTS,
      remainingAttempts,
      suspiciousActivity,
      message: remainingAttempts <= 2 ? `${remainingAttempts} attempts remaining` : undefined
    };
  }

  async recordAttempt(identifier: string, success: boolean, action: string = 'login'): Promise<void> {
    const ip = this.getClientIP();
    const now = Date.now();

    let ipEntry = this.ipAttempts.get(ip);
    if (!ipEntry) {
      ipEntry = { attempts: 0, firstAttempt: now, lastAttempt: now };
    }

    if (!success) {
      ipEntry.attempts++;
      ipEntry.lastAttempt = now;

      // Lock out after max attempts
      if (ipEntry.attempts >= this.MAX_ATTEMPTS) {
        ipEntry.lockoutUntil = now + (this.LOCKOUT_MINUTES * 60 * 1000);
        this.suspiciousIPs.add(ip);
      }

      this.ipAttempts.set(ip, ipEntry);

      // Log security event
      console.warn('🚨 Failed login attempt from IP:', ip, {
        attempts: ipEntry.attempts,
        identifier,
        action
      });
    } else {
      // Reset on successful login
      this.ipAttempts.delete(ip);
      this.suspiciousIPs.delete(ip);
    }
  }

  getSuspiciousIPs(): string[] {
    return Array.from(this.suspiciousIPs);
  }

  clearIPLockout(ip: string): void {
    this.ipAttempts.delete(ip);
    this.suspiciousIPs.delete(ip);
  }

  getIPStats(): { totalIPs: number; blockedIPs: number; suspiciousIPs: number } {
    return {
      totalIPs: this.ipAttempts.size,
      blockedIPs: Array.from(this.ipAttempts.values()).filter(entry => 
        entry.lockoutUntil && Date.now() < entry.lockoutUntil
      ).length,
      suspiciousIPs: this.suspiciousIPs.size
    };
  }
}

export const advancedRateLimitService = new AdvancedRateLimitService();
