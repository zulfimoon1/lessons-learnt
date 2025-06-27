
import { useCallback, useMemo, useRef } from 'react';

// Simplified debounce hook - single responsibility
export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Simplified search filter - focused functionality
export const useSearchFilter = <T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, term: string) => boolean
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [items, searchTerm, filterFn]);
};
