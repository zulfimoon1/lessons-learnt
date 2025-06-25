
import React from 'react';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { cn } from '@/lib/utils';

interface MobileEnhancedWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableTouchOptimizations?: boolean;
}

const MobileEnhancedWrapper: React.FC<MobileEnhancedWrapperProps> = ({
  children,
  className,
  enableTouchOptimizations = true
}) => {
  const { isNative, platform, isOnline, isLoading } = useMobileCapabilities();

  // Don't modify anything while loading to preserve existing functionality
  if (isLoading) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        // Base classes - preserve existing styling
        className,
        // Add mobile enhancements only when appropriate
        enableTouchOptimizations && {
          // iOS specific optimizations
          'ios:touch-manipulation ios:select-none': platform === 'ios',
          // Android specific optimizations  
          'android:overscroll-none': platform === 'android',
          // Native app optimizations
          'native:user-select-none': isNative,
          // Offline state indicator
          'offline:opacity-90 offline:pointer-events-none': !isOnline
        }
      )}
      data-platform={platform}
      data-native={isNative}
      data-online={isOnline}
    >
      {children}
      
      {/* Optional offline indicator - non-intrusive */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm z-50">
          Offline Mode
        </div>
      )}
    </div>
  );
};

export default MobileEnhancedWrapper;
