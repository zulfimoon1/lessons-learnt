
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDeviceType } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  fullWidth?: boolean;
  touchOptimized?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  fullWidth = false,
  touchOptimized = true,
  ...props
}) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <Button
      variant={variant}
      size={isMobile && touchOptimized ? 'lg' : size}
      className={cn(
        // Base mobile optimizations
        isMobile && touchOptimized && [
          'min-h-12 py-3 px-4',
          'text-base',
          'touch-manipulation',
          'transition-all duration-200',
          'active:scale-95'
        ],
        // Full width on mobile if requested
        (fullWidth || (isMobile && touchOptimized)) && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MobileOptimizedButton;
