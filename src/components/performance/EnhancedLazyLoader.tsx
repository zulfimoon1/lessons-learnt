
import React, { Suspense, memo, useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useDeviceType } from '@/hooks/use-device';

interface EnhancedLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  threshold?: number;
  rootMargin?: string;
  loading?: 'lazy' | 'eager';
}

const MobileFallback: React.FC<{ minHeight?: string }> = ({ minHeight = "150px" }) => (
  <Card className="w-full" style={{ minHeight }}>
    <CardContent className="flex items-center justify-center h-full p-4">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand-teal" />
        <p className="text-xs text-gray-600">Loading...</p>
      </div>
    </CardContent>
  </Card>
);

const DesktopFallback: React.FC<{ minHeight?: string }> = ({ minHeight = "200px" }) => (
  <Card className="w-full" style={{ minHeight }}>
    <CardContent className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
        <p className="text-sm text-gray-600">Loading content...</p>
      </div>
    </CardContent>
  </Card>
);

const EnhancedLazyLoader: React.FC<EnhancedLazyLoaderProps> = memo(({ 
  children, 
  fallback,
  minHeight = "200px",
  threshold = 0.1,
  rootMargin = "50px",
  loading = "lazy"
}) => {
  const deviceType = useDeviceType();
  const [isInView, setIsInView] = useState(loading === 'eager');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === 'eager' || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, loading]);

  const LoadingFallback = fallback || (
    deviceType === 'mobile' ? 
      <MobileFallback minHeight={minHeight} /> : 
      <DesktopFallback minHeight={minHeight} />
  );

  return (
    <div ref={ref} className="w-full">
      {isInView ? (
        <Suspense fallback={LoadingFallback}>
          {children}
        </Suspense>
      ) : (
        LoadingFallback
      )}
    </div>
  );
});

EnhancedLazyLoader.displayName = 'EnhancedLazyLoader';

export default EnhancedLazyLoader;
