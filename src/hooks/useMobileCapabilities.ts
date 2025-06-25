
import { useState, useEffect } from 'react';
import { MobileCapacitorService, MobileCapabilities } from '@/services/mobileCapacitorService';

export const useMobileCapabilities = () => {
  const [capabilities, setCapabilities] = useState<MobileCapabilities>({
    isNative: false,
    platform: 'web',
    isOnline: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMobile = async () => {
      try {
        console.log('🚀 Initializing mobile capabilities...');
        
        // Get current capabilities
        const caps = MobileCapacitorService.getMobileCapabilities();
        setCapabilities(caps);
        
        // Log platform info for debugging
        MobileCapacitorService.logPlatformInfo();
        
        // Check if app is ready
        const isReady = await MobileCapacitorService.isAppReady();
        console.log('📱 Mobile app ready:', isReady);
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error initializing mobile capabilities:', error);
        setIsLoading(false);
      }
    };

    initializeMobile();

    // Listen for online/offline changes
    const handleOnline = () => {
      setCapabilities(prev => ({ ...prev, isOnline: true }));
      console.log('📡 App is now online');
    };

    const handleOffline = () => {
      setCapabilities(prev => ({ ...prev, isOnline: false }));
      console.log('📡 App is now offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...capabilities,
    isLoading,
    isMobile: capabilities.platform !== 'web',
    isIOS: capabilities.platform === 'ios',
    isAndroid: capabilities.platform === 'android'
  };
};

export default useMobileCapabilities;
