
import { cacheManager } from './offline/cacheManager';
import { syncManager } from './offline/syncManager';

interface SmartSyncConfig {
  enableBatchSync: boolean;
  batchSize: number;
  syncInterval: number;
  priorityBasedSync: boolean;
  conflictResolution: 'client' | 'server' | 'merge';
}

class EnhancedOfflineDataService {
  async smartCacheData(
    table: string, 
    data: any[], 
    priority: 'high' | 'medium' | 'low' = 'medium',
    ttl?: number
  ): Promise<void> {
    return cacheManager.smartCacheData(table, data, priority, ttl);
  }

  getSmartCachedData(table: string, includeStale: boolean = true): any[] {
    return cacheManager.getSmartCachedData(table, includeStale);
  }

  async initializeSmartSync(): Promise<void> {
    return syncManager.initializeSmartSync();
  }

  async prefetchCriticalData(tables: string[]): Promise<void> {
    return syncManager.prefetchCriticalData(tables);
  }

  getCacheStats() {
    return cacheManager.getCacheStats();
  }

  updateConfig(newConfig: Partial<SmartSyncConfig>): void {
    syncManager.updateConfig(newConfig);
    // Restart sync with new config
    this.initializeSmartSync();
  }

  clearExpiredCache(): number {
    return cacheManager.clearExpiredCache();
  }

  cleanup(): void {
    syncManager.cleanup();
  }
}

export const enhancedOfflineDataService = new EnhancedOfflineDataService();
