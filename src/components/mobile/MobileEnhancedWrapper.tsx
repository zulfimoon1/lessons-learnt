
import React, { useEffect } from 'react';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { useAutomatedNotifications } from '@/hooks/useAutomatedNotifications';
import { cn } from '@/lib/utils';

interface MobileEnhancedWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableTouchOptimizations?: boolean;
  enableDistressDetection?: boolean;
}

const MobileEnhancedWrapper: React.FC<MobileEnhancedWrapperProps> = ({
  children,
  className,
  enableTouchOptimizations = true,
  enableDistressDetection = false
}) => {
  const { isNative, platform, isOnline, isLoading } = useMobileCapabilities();
  const { pendingNotifications } = useAutomatedNotifications();

  // Log platform capabilities for debugging
  useEffect(() => {
    if (!isLoading) {
      console.log('📱 Mobile Enhanced Wrapper initialized:', {
        platform,
        isNative,
        isOnline,
        hasNotifications: pendingNotifications.length > 0
      });
    }
  }, [isLoading, platform, isNative, isOnline, pendingNotifications.length]);

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
      data-distress-detection={enableDistressDetection}
    >
      {children}
      
      {/* Enhanced status indicators */}
      <div className="fixed bottom-4 left-4 space-y-2 z-50">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            Offline Mode
          </div>
        )}
        
        {/* Critical notifications indicator */}
        {pendingNotifications.some(n => n.analysis.riskLevel === 'critical') && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
            Critical Alert
          </div>
        )}
        
        {/* Platform indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
            {platform} {isNative ? 'Native' : 'Web'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileEnhancedWrapper;
