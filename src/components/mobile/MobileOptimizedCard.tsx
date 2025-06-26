
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeviceType } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  icon,
  actions
}) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <Card className={cn(
      'bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow',
      isMobile && 'mx-2',
      className
    )}>
      {(title || description || icon || actions) && (
        <CardHeader className={cn(
          isMobile ? 'p-4 pb-2' : 'p-6',
          headerClassName
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className={cn(
                  'flex-shrink-0 rounded-lg flex items-center justify-center',
                  isMobile ? 'w-10 h-10' : 'w-12 h-12'
                )}>
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <CardTitle className={cn(
                    'text-brand-dark',
                    isMobile ? 'text-base leading-tight' : 'text-lg'
                  )}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className={cn(
                    'text-gray-600 mt-1',
                    isMobile ? 'text-sm leading-relaxed' : 'text-base'
                  )}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex-shrink-0 ml-2">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        isMobile ? 'p-4 pt-2' : 'p-6',
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;
