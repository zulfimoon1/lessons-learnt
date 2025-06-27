
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeviceType } from '@/hooks/use-device';

interface OptimizedButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const OptimizedButton: React.FC<OptimizedButtonProps> = ({
  children,
  className,
  touchOptimized = false,
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <Button
      className={cn(
        // Base mobile optimizations
        isMobile && touchOptimized && 'min-h-[44px] px-4 py-3 text-base',
        // Full width option
        fullWidth && 'w-full',
        // Loading state
        loading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default React.memo(OptimizedButton);
