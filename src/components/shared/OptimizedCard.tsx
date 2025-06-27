
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDeviceType } from '@/hooks/use-device';

interface OptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const OptimizedCard: React.FC<OptimizedCardProps> = ({
  title,
  children,
  className,
  icon,
  actions,
  variant = 'default',
  size = 'md'
}) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const variants = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
    outline: 'bg-transparent border-2 border-gray-300'
  };

  const sizes = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-5' : 'p-8'
  };

  return (
    <Card className={cn(
      'shadow-sm hover:shadow-md transition-shadow duration-200',
      variants[variant],
      className
    )}>
      {title && (
        <CardHeader className={cn(
          'flex flex-row items-center justify-between space-y-0',
          sizes[size]
        )}>
          <CardTitle className={cn(
            'flex items-center gap-2',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {icon}
            {title}
          </CardTitle>
          {actions}
        </CardHeader>
      )}
      <CardContent className={cn(
        title ? 'pt-0' : '',
        sizes[size]
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default React.memo(OptimizedCard);
