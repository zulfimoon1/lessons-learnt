
import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  header,
  footer,
  className,
  enablePullToRefresh = false,
  onRefresh
}) => {
  const { isMobile, isNative } = useMobileCapabilities();

  return (
    <div className={cn(
      'flex flex-col min-h-screen',
      isMobile && 'touch-manipulation',
      className
    )}>
      {/* Header */}
      {header && (
        <header className={cn(
          'sticky top-0 z-40 bg-white border-b',
          isNative && 'ios:pt-safe-top android:pt-status-bar'
        )}>
          {header}
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        'flex-1 overflow-auto',
        enablePullToRefresh && 'overscroll-contain',
        isMobile && 'pb-4'
      )}>
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer className={cn(
          'sticky bottom-0 z-40 bg-white border-t',
          isNative && 'ios:pb-safe-bottom android:pb-nav-bar'
        )}>
          {footer}
        </footer>
      )}
    </div>
  );
};

export default MobileOptimizedLayout;
