
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({ 
  title, 
  description, 
  children, 
  className,
  icon,
  priority = 'medium'
}) => {
  const isMobile = useIsMobile();

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        isMobile ? 'rounded-lg shadow-sm' : 'rounded-xl shadow-md',
        priority === 'high' && 'border-brand-orange/30 bg-gradient-to-br from-orange-50/50 to-white',
        priority === 'medium' && 'border-brand-teal/20 bg-white',
        priority === 'low' && 'border-gray-200 bg-gray-50/30',
        className
      )}
      role="region"
      aria-labelledby={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <CardHeader className={cn(
        'space-y-1',
        isMobile ? 'p-4 pb-2' : 'p-6 pb-4'
      )}>
        <CardTitle 
          id={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            'flex items-center gap-2',
            isMobile ? 'text-lg' : 'text-xl'
          )}
        >
          {icon && (
            <span className="text-brand-teal" aria-hidden="true">
              {icon}
            </span>
          )}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn(
            'text-muted-foreground',
            isMobile ? 'text-sm' : 'text-base'
          )}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn(
        isMobile ? 'p-4 pt-0' : 'p-6 pt-0'
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;
