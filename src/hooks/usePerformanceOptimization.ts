
import { useCallback, useMemo, useRef } from 'react';

// Custom hook for debouncing functions
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

// Custom hook for throttling functions
export const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastExecuted = useRef<number>(0);
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    
    if (now - lastExecuted.current >= delay) {
      callback(...args);
      lastExecuted.current = now;
    }
  }, [callback, delay]);
};

// Custom hook for memoized search filtering
export const useOptimizedFilter = <T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, term: string) => boolean
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    return items.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [items, searchTerm, filterFn]);
};

// Custom hook for pagination with performance optimization
export const useOptimizedPagination = <T>(
  items: T[],
  itemsPerPage: number = 20
) => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const getPaginatedItems = useCallback((currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, itemsPerPage]);
  
  return {
    totalPages,
    getPaginatedItems,
    totalItems: items.length
  };
};
