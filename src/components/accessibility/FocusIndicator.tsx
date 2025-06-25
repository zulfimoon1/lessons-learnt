
import React from 'react';
import { cn } from '@/lib/utils';

interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className,
  variant = 'default'
}) => {
  const focusClasses = {
    default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    primary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2',
    secondary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2'
  };

  return (
    <div className={cn(focusClasses[variant], className)}>
      {children}
    </div>
  );
};

export default FocusIndicator;
