
import { supabase } from '@/integrations/supabase/client';
import { offlineDataService } from './offlineDataService';

interface CachedDataEntry {
  id: string;
  table: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
  syncState: 'fresh' | 'stale' | 'expired';
}

interface SmartSyncConfig {
  enableBatchSync: boolean;
  batchSize: number;
  syncInterval: number;
  priorityBasedSync: boolean;
  conflictResolution: 'client' | 'server' | 'merge';
}

class EnhancedOfflineDataService {
  private readonly CACHE_KEY = 'enhanced_offline_cache';
  private readonly CONFIG_KEY = 'smart_sync_config';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private syncTimer: NodeJS.Timeout | null = null;

  private getDefaultConfig(): SmartSyncConfig {
    return {
      enableBatchSync: true,
      batchSize: 10,
      syncInterval: 30000, // 30 seconds
      priorityBasedSync: true,
      conflictResolution: 'merge'
    };
  }

  private getCachedEntries(): CachedDataEntry[] {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    } catch (error) {
      console.error('Error reading enhanced cache:', error);
      return [];
    }
  }

  private saveCachedEntries(entries: CachedDataEntry[]): void {
    try {
      // Limit cache size and prioritize by importance
      const sortedEntries = entries
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 500); // Keep max 500 entries

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(sortedEntries));
    } catch (error) {
      console.error('Error saving enhanced cache:', error);
    }
  }

  async smartCacheData(
    table: string, 
    data: any[], 
    priority: 'high' | 'medium' | 'low' = 'medium',
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const entries = this.getCachedEntries();
    const now = Date.now();
    
    // Remove old entries for this table
    const filteredEntries = entries.filter(entry => entry.table !== table);
    
    // Add new entries
    const newEntries: CachedDataEntry[] = data.map((item, index) => ({
      id: `${table}_${item.id || index}_${now}`,
      table,
      data: item,
      timestamp: now,
      expiresAt: now + ttl,
      priority,
      syncState: 'fresh'
    }));

    this.saveCachedEntries([...filteredEntries, ...newEntries]);
  }

  getSmartCachedData(table: string, includeStale: boolean = true): any[] {
    const entries = this.getCachedEntries();
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
        } else if (now - entry.timestamp > this.DEFAULT_TTL / 2) {
          entry.syncState = 'stale';
        }
        return entry.data;
      });
  }

  async initializeSmartSync(): Promise<void> {
    const config = this.getConfig();
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.performSmartSync();
    }, config.syncInterval);

    console.log('🔄 Smart sync initialized with config:', config);
  }

  private async performSmartSync(): Promise<void> {
    if (!navigator.onLine) return;

    const config = this.getConfig();
    const entries = this.getCachedEntries();
    const now = Date.now();

    // Find entries that need syncing
    const staleEntries = entries.filter(entry => 
      entry.syncState === 'stale' || entry.syncState === 'expired'
    );

    if (staleEntries.length === 0) return;

    // Group by priority and table
    const syncGroups = this.groupEntriesForSync(staleEntries, config);

    for (const group of syncGroups) {
      try {
        await this.syncDataGroup(group);
      } catch (error) {
        console.error('Smart sync error for group:', group.table, error);
      }
    }
  }

  private groupEntriesForSync(entries: CachedDataEntry[], config: SmartSyncConfig) {
    const groups = new Map<string, { table: string; entries: CachedDataEntry[]; priority: number }>();

    entries.forEach(entry => {
      const key = entry.table;
      if (!groups.has(key)) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        groups.set(key, {
          table: entry.table,
          entries: [],
          priority: priorityOrder[entry.priority]
        });
      }
      groups.get(key)?.entries.push(entry);
    });

    // Sort by priority if enabled
    if (config.priorityBasedSync) {
      return Array.from(groups.values())
        .sort((a, b) => b.priority - a.priority)
        .slice(0, config.batchSize);
    }

    return Array.from(groups.values()).slice(0, config.batchSize);
  }

  private async syncDataGroup(group: { table: string; entries: CachedDataEntry[] }): Promise<void> {
    try {
      // Fetch fresh data from server using type assertion for dynamic table names
      const { data: freshData, error } = await (supabase as any)
        .from(group.table)
        .select('*')
        .in('id', group.entries.map(e => e.data.id).filter(Boolean));

      if (error) throw error;

      // Update cache with fresh data
      if (freshData && freshData.length > 0) {
        await this.smartCacheData(group.table, freshData, 'high');
        console.log(`🔄 Synced ${freshData.length} items for table: ${group.table}`);
      }
    } catch (error) {
      console.error(`Smart sync failed for table ${group.table}:`, error);
    }
  }

  async prefetchCriticalData(tables: string[]): Promise<void> {
    if (!navigator.onLine) return;

    for (const table of tables) {
      try {
        const { data, error } = await (supabase as any)
          .from(table)
          .select('*')
          .limit(100);

        if (error) throw error;

        if (data) {
          await this.smartCacheData(table, data, 'high');
          console.log(`📦 Prefetched critical data for: ${table}`);
        }
      } catch (error) {
        console.error(`Prefetch failed for table ${table}:`, error);
      }
    }
  }

  getCacheStats() {
    const entries = this.getCachedEntries();
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(e => e.syncState === 'fresh').length,
      staleEntries: entries.filter(e => e.syncState === 'stale').length,
      expiredEntries: entries.filter(e => e.syncState === 'expired').length,
      highPriority: entries.filter(e => e.priority === 'high').length,
      mediumPriority: entries.filter(e => e.priority === 'medium').length,
      lowPriority: entries.filter(e => e.priority === 'low').length,
      cacheSize: this.getCacheSize(),
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }

  private getCacheSize(): number {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? new Blob([cache]).size : 0;
    } catch {
      return 0;
    }
  }

  private getConfig(): SmartSyncConfig {
    try {
      const config = localStorage.getItem(this.CONFIG_KEY);
      return config ? { ...this.getDefaultConfig(), ...JSON.parse(config) } : this.getDefaultConfig();
    } catch {
      return this.getDefaultConfig();
    }
  }

  updateConfig(newConfig: Partial<SmartSyncConfig>): void {
    const currentConfig = this.getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updatedConfig));

    // Restart sync with new config
    this.initializeSmartSync();
  }

  clearExpiredCache(): number {
    const entries = this.getCachedEntries();
    const now = Date.now();
    const validEntries = entries.filter(entry => entry.expiresAt > now);
    const removedCount = entries.length - validEntries.length;
    
    this.saveCachedEntries(validEntries);
    console.log(`🧹 Cleared ${removedCount} expired cache entries`);
    
    return removedCount;
  }

  cleanup(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

export const enhancedOfflineDataService = new EnhancedOfflineDataService();
