
import { Capacitor } from '@capacitor/core';

export interface MobileCapabilities {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isOnline: boolean;
}

export class MobileCapacitorService {
  static getMobileCapabilities(): MobileCapabilities {
    return {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
      isOnline: navigator.onLine
    };
  }

  static async isAppReady(): Promise<boolean> {
    try {
      // Basic capability check
      const caps = this.getMobileCapabilities();
      console.log('📱 Mobile capabilities:', caps);
      return true;
    } catch (error) {
      console.error('❌ Mobile service error:', error);
      return false;
    }
  }

  static logPlatformInfo(): void {
    const caps = this.getMobileCapabilities();
    console.log('📱 Platform Info:', {
      isNative: caps.isNative,
      platform: caps.platform,
      isOnline: caps.isOnline,
      userAgent: navigator.userAgent
    });
  }
}

export default MobileCapacitorService;
