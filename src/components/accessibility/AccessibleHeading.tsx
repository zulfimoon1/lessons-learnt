
import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({
  level,
  children,
  className,
  id,
  visualLevel
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const displayLevel = visualLevel || level;
  
  const headingClasses = {
    1: 'text-3xl md:text-4xl font-bold',
    2: 'text-2xl md:text-3xl font-semibold',
    3: 'text-xl md:text-2xl font-semibold',
    4: 'text-lg md:text-xl font-medium',
    5: 'text-base md:text-lg font-medium',
    6: 'text-sm md:text-base font-medium'
  };

  return (
    <Component
      id={id}
      className={cn(headingClasses[displayLevel], className)}
    >
      {children}
    </Component>
  );
};

export default AccessibleHeading;
