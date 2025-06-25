
import { cacheManager } from './offline/CacheManager';
import { smartSyncManager } from './offline/SmartSyncManager';
import { dataPrefetcher } from './offline/DataPrefetcher';

class EnhancedOfflineDataService {
  async smartCacheData(
    table: string, 
    data: any[], 
    priority: 'high' | 'medium' | 'low' = 'medium',
    ttl: number = 24 * 60 * 60 * 1000
  ): Promise<void> {
    return smartSyncManager.smartCacheData(table, data, priority, ttl);
  }

  getSmartCachedData(table: string, includeStale: boolean = true): any[] {
    const entries = cacheManager.getCachedEntries();
    const now = Date.now();
    
    return entries
      .filter(entry => {
        if (entry.table !== table) return false;
        if (entry.expiresAt < now && !includeStale) return false;
        return true;
      })
      .map(entry => {
        // Update sync state based on age
        if (entry.expiresAt < now) {
          entry.syncState = 'expired';
        } else if (now - entry.timestamp > 24 * 60 * 60 * 1000 / 2) {
          entry.syncState = 'stale';
        }
        return entry.data;
      });
  }

  async initializeSmartSync(): Promise<void> {
    return smartSyncManager.initializeSmartSync();
  }

  async prefetchCriticalData(tables: string[]): Promise<void> {
    return dataPrefetcher.prefetchCriticalData(tables);
  }

  getCacheStats() {
    return cacheManager.getCacheStats();
  }

  updateConfig(newConfig: any): void {
    smartSyncManager.updateConfig(newConfig);
  }

  clearExpiredCache(): number {
    return cacheManager.clearExpiredCache();
  }

  cleanup(): void {
    smartSyncManager.cleanup();
  }
}

export const enhancedOfflineDataService = new EnhancedOfflineDataService();
