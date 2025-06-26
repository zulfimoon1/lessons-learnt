
import React from 'react';
import { useDeviceType } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className
}) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  return (
    <div className={cn(
      'min-h-screen',
      isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6',
      className
    )}>
      {children}
    </div>
  );
};

export default MobileOptimizedLayout;
