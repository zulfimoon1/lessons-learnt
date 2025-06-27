
import { useCallback, useMemo } from 'react';
import { useDeviceType } from './use-device';

export const useMobileOptimization = () => {
  const deviceType = useDeviceType();
  
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  const getResponsiveClasses = useCallback((config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }) => {
    return {
      mobile: isMobile ? config.mobile || '' : '',
      tablet: isTablet ? config.tablet || '' : '',
      desktop: isDesktop ? config.desktop || '' : '',
      combined: [
        isMobile ? config.mobile || '' : '',
        isTablet ? config.tablet || '' : '',
        isDesktop ? config.desktop || '' : ''
      ].filter(Boolean).join(' ')
    };
  }, [isMobile, isTablet, isDesktop]);

  const getOptimalGridCols = useCallback((itemCount: number) => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(itemCount, 2);
    return Math.min(itemCount, 3);
  }, [isMobile, isTablet]);

  const getTouchOptimizedProps = useMemo(() => ({
    className: isMobile ? 'min-h-[44px] text-base' : '',
    touchOptimized: isMobile
  }), [isMobile]);

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveClasses,
    getOptimalGridCols,
    getTouchOptimizedProps
  };
};
