
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableTouchOptimizations?: boolean;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  enableTouchOptimizations = true
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        // Mobile-specific optimizations
        isMobile && [
          'touch-manipulation', // Improve touch responsiveness
          'select-none', // Prevent text selection on mobile
          'overflow-x-hidden', // Prevent horizontal scroll
        ],
        // Touch optimizations
        enableTouchOptimizations && [
          'tap-highlight-transparent', // Remove tap highlights
          'user-select-none', // Prevent text selection
        ],
        className
      )}
      style={{
        // Mobile viewport optimizations
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        // Prevent zoom on input focus
        fontSize: isMobile ? '16px' : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default MobileOptimizedLayout;
