
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  children,
  error,
  required = false,
  description,
  className
}) => {
  const isMobile = useIsMobile();
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={cn('space-y-2', className)} role="group">
      <label 
        htmlFor={fieldId}
        className={cn(
          'block font-medium text-foreground',
          isMobile ? 'text-sm' : 'text-base',
          error && 'text-destructive'
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className={cn(
            'text-muted-foreground',
            isMobile ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': cn(
            error && errorId,
            description && descriptionId
          ).trim() || undefined,
          'aria-invalid': error ? 'true' : 'false',
          className: cn(
            'w-full',
            isMobile && 'min-h-[44px] touch-manipulation',
            error && 'border-destructive focus:border-destructive',
            (children as React.ReactElement).props?.className
          )
        })}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className={cn(
            'text-destructive',
            isMobile ? 'text-xs' : 'text-sm'
          )}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default MobileFormField;
