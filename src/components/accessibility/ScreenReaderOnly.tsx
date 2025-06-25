
import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  className,
  as: Component = 'span'
}) => {
  return (
    <Component
      className={cn(
        'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default ScreenReaderOnly;
