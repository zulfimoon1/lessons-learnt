
import { useState, useEffect, useCallback } from 'react';
import { enhancedOfflineDataService } from '@/services/enhancedOfflineDataService';
import { useOfflineCapabilities } from './useOfflineCapabilities';

interface UseEnhancedOfflineOptions {
  tables?: string[];
  enableSmartSync?: boolean;
  enablePrefetch?: boolean;
  syncInterval?: number;
  priority?: 'high' | 'medium' | 'low';
}

export const useEnhancedOffline = (options: UseEnhancedOfflineOptions = {}) => {
  const {
    tables = [],
    enableSmartSync = true,
    enablePrefetch = true,
    syncInterval = 30000,
    priority = 'medium'
  } = options;

  const { isOnline, syncStatus } = useOfflineCapabilities();
  const [smartSyncEnabled, setSmartSyncEnabled] = useState(false);
  const [cacheStats, setCacheStats] = useState(enhancedOfflineDataService.getCacheStats());
  const [lastPrefetch, setLastPrefetch] = useState<Date | null>(null);

  // Initialize smart sync
  useEffect(() => {
    if (enableSmartSync && !smartSyncEnabled) {
      enhancedOfflineDataService.initializeSmartSync();
      setSmartSyncEnabled(true);
      console.log('🚀 Enhanced offline capabilities initialized');
    }

    return () => {
      enhancedOfflineDataService.cleanup();
    };
  }, [enableSmartSync, smartSyncEnabled]);

  // Prefetch critical data when online
  useEffect(() => {
    if (isOnline && enablePrefetch && tables.length > 0) {
      const shouldPrefetch = !lastPrefetch || 
        (Date.now() - lastPrefetch.getTime()) > 5 * 60 * 1000; // 5 minutes

      if (shouldPrefetch) {
        enhancedOfflineDataService.prefetchCriticalData(tables)
          .then(() => {
            setLastPrefetch(new Date());
            setCacheStats(enhancedOfflineDataService.getCacheStats());
          });
      }
    }
  }, [isOnline, enablePrefetch, tables, lastPrefetch]);

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(enhancedOfflineDataService.getCacheStats());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const smartCacheData = useCallback(async (
    table: string, 
    data: any[], 
    cachePriority: 'high' | 'medium' | 'low' = priority
  ) => {
    await enhancedOfflineDataService.smartCacheData(table, data, cachePriority);
    setCacheStats(enhancedOfflineDataService.getCacheStats());
  }, [priority]);

  const getSmartCachedData = useCallback((
    table: string, 
    includeStale: boolean = true
  ) => {
    return enhancedOfflineDataService.getSmartCachedData(table, includeStale);
  }, []);

  const updateSyncConfig = useCallback((newConfig: any) => {
    enhancedOfflineDataService.updateConfig(newConfig);
  }, []);

  const clearExpiredCache = useCallback(() => {
    const removedCount = enhancedOfflineDataService.clearExpiredCache();
    setCacheStats(enhancedOfflineDataService.getCacheStats());
    return removedCount;
  }, []);

  const getOfflineCapabilities = useCallback(() => {
    return {
      isOnline,
      smartSyncEnabled,
      cacheStats,
      lastPrefetch,
      syncStatus,
      hasStaleData: cacheStats.staleEntries > 0,
      hasExpiredData: cacheStats.expiredEntries > 0,
      cacheHealthScore: calculateCacheHealthScore(cacheStats)
    };
  }, [isOnline, smartSyncEnabled, cacheStats, lastPrefetch, syncStatus]);

  return {
    smartCacheData,
    getSmartCachedData,
    updateSyncConfig,
    clearExpiredCache,
    getOfflineCapabilities,
    cacheStats,
    isOnline,
    smartSyncEnabled
  };
};

function calculateCacheHealthScore(stats: any): number {
  const total = stats.totalEntries;
  if (total === 0) return 100;

  const fresh = stats.freshEntries;
  const stale = stats.staleEntries;
  const expired = stats.expiredEntries;

  // Calculate health score (0-100)
  const freshScore = (fresh / total) * 70;
  const staleScore = (stale / total) * 20;
  const expiredScore = (expired / total) * 0;

  return Math.round(freshScore + staleScore + expiredScore);
}

export default useEnhancedOffline;
