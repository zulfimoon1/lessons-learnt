
import React, { Suspense, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MentalHealthErrorBoundary from "./MentalHealthErrorBoundary";

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

const DefaultFallback: React.FC<{ minHeight?: string }> = ({ minHeight = "200px" }) => (
  <Card className="w-full" style={{ minHeight }}>
    <CardContent className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Loading mental health data...</p>
      </div>
    </CardContent>
  </Card>
);

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = memo(({ 
  children, 
  fallback,
  minHeight = "200px" 
}) => {
  const LoadingFallback = fallback || <DefaultFallback minHeight={minHeight} />;

  return (
    <MentalHealthErrorBoundary>
      <Suspense fallback={LoadingFallback}>
        <div className="w-full">
          {children}
        </div>
      </Suspense>
    </MentalHealthErrorBoundary>
  );
});

LazyLoadWrapper.displayName = 'LazyLoadWrapper';

export default LazyLoadWrapper;
