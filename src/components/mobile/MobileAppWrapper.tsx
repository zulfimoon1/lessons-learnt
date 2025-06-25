
import React, { useEffect } from 'react';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { cn } from '@/lib/utils';

interface MobileAppWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const MobileAppWrapper: React.FC<MobileAppWrapperProps> = ({
  children,
  className
}) => {
  const { isNative, platform, isOnline, isLoading } = useMobileCapabilities();

  useEffect(() => {
    if (isNative) {
      // Enable native app optimizations
      document.body.classList.add('mobile-app-mode');
      
      // Prevent default touch behaviors that interfere with native scrolling
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      return () => {
        document.body.classList.remove('mobile-app-mode');
      };
    }
  }, [isNative]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-gray-50',
        // Native app specific styles
        isNative && [
          'select-none overflow-hidden',
          'ios:pt-safe-top ios:pb-safe-bottom',
          'android:pt-status-bar'
        ],
        // Offline indicators
        !isOnline && 'opacity-95',
        className
      )}
      data-platform={platform}
      data-native={isNative}
      data-online={isOnline}
    >
      {children}
      
      {/* Status bar for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 bg-black text-white text-xs p-1 z-50">
          {platform} {isNative ? 'Native' : 'Web'} {isOnline ? '🟢' : '🔴'}
        </div>
      )}
    </div>
  );
};

export default MobileAppWrapper;
