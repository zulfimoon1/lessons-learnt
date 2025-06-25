
import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from './cacheManager';

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

export class SyncManager {
  private readonly CONFIG_KEY = 'smart_sync_config';
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

  getConfig(): SmartSyncConfig {
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
    const entries = cacheManager.getCachedEntries();

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
        await cacheManager.smartCacheData(group.table, freshData, 'high');
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
          await cacheManager.smartCacheData(table, data, 'high');
          console.log(`📦 Prefetched critical data for: ${table}`);
        }
      } catch (error) {
        console.error(`Prefetch failed for table ${table}:`, error);
      }
    }
  }

  cleanup(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

export const syncManager = new SyncManager();
