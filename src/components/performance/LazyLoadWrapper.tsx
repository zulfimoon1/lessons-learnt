
import React, { Suspense, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = memo(() => (
  <Card className="animate-pulse">
    <CardContent className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
      <span className="ml-3 text-brand-dark">Loading...</span>
    </CardContent>
  </Card>
));

DefaultFallback.displayName = "DefaultFallback";

const LazyLoadWrapper = memo(({ children, fallback, className }: LazyLoadWrapperProps) => (
  <div className={className}>
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  </div>
));

LazyLoadWrapper.displayName = "LazyLoadWrapper";

export default LazyLoadWrapper;
