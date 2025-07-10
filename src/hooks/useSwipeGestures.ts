import { useEffect, useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

export const useSwipeGestures = (config: SwipeConfig) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const threshold = config.threshold || 50;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (config.preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, [config.preventDefaultTouchmoveEvent]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);

    if (isHorizontalSwipe && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && config.onSwipeLeft) {
        config.onSwipeLeft();
      } else if (deltaX < 0 && config.onSwipeRight) {
        config.onSwipeRight();
      }
    }

    if (isVerticalSwipe && Math.abs(deltaY) > threshold) {
      if (deltaY > 0 && config.onSwipeUp) {
        config.onSwipeUp();
      } else if (deltaY < 0 && config.onSwipeDown) {
        config.onSwipeDown();
      }
    }
  }, [config, threshold]);

  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !config.preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, config.preventDefaultTouchmoveEvent]);

  return elementRef;
};