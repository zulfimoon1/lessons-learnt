
import { useState, useEffect, useCallback } from 'react';
import { useMobileCapabilities } from './useMobileCapabilities';

interface MobileAppState {
  isActive: boolean;
  isBackground: boolean;
  orientation: 'portrait' | 'landscape';
  networkType: string;
  batteryLevel?: number;
}

export const useMobileAppState = () => {
  const { isNative } = useMobileCapabilities();
  const [appState, setAppState] = useState<MobileAppState>({
    isActive: true,
    isBackground: false,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    networkType: 'unknown'
  });

  const handleVisibilityChange = useCallback(() => {
    const isHidden = document.hidden;
    setAppState(prev => ({
      ...prev,
      isActive: !isHidden,
      isBackground: isHidden
    }));
  }, []);

  const handleOrientationChange = useCallback(() => {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    setAppState(prev => ({
      ...prev,
      orientation
    }));
  }, []);

  useEffect(() => {
    // Listen for app state changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Get network information if available
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setAppState(prev => ({
          ...prev,
          networkType: connection.effectiveType || connection.type || 'unknown'
        }));
      }
    };

    updateNetworkInfo();

    // Listen for network changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [handleVisibilityChange, handleOrientationChange]);

  const optimizeForBattery = useCallback(() => {
    if (appState.batteryLevel && appState.batteryLevel < 0.2) {
      // Reduce animations and background processes
      return {
        reduceAnimations: true,
        limitBackgroundSync: true,
        reducePollFrequency: true
      };
    }
    return {
      reduceAnimations: false,
      limitBackgroundSync: false,
      reducePollFrequency: false
    };
  }, [appState.batteryLevel]);

  return {
    appState,
    optimizeForBattery
  };
};

export default useMobileAppState;
