
import { supabase } from '@/integrations/supabase/client';
import { cacheManager, CachedDataEntry } from './CacheManager';

interface SmartSyncConfig {
  enableBatchSync: boolean;
  batchSize: number;
  syncInterval: number;
  priorityBasedSync: boolean;
  conflictResolution: 'client' | 'server' | 'merge';
}

class SmartSyncManager {
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
      // Type-safe table access - only sync known tables
      const validTables = ['feedback', 'mental_health_alerts', 'class_schedules', 'weekly_summaries'];
      
      if (!validTables.includes(group.table)) {
        console.warn(`Skipping sync for unknown table: ${group.table}`);
        return;
      }

      let freshData: any[] = [];

      // Type-safe supabase queries for specific tables
      switch (group.table) {
        case 'feedback':
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('feedback')
            .select('*')
            .in('id', group.entries.map(e => e.data.id).filter(Boolean));
          
          if (feedbackError) throw feedbackError;
          freshData = feedbackData || [];
          break;

        case 'mental_health_alerts':
          const { data: alertsData, error: alertsError } = await supabase
            .from('mental_health_alerts')
            .select('*')
            .in('id', group.entries.map(e => e.data.id).filter(Boolean));
          
          if (alertsError) throw alertsError;
          freshData = alertsData || [];
          break;

        case 'class_schedules':
          const { data: schedulesData, error: schedulesError } = await supabase
            .from('class_schedules')
            .select('*')
            .in('id', group.entries.map(e => e.data.id).filter(Boolean));
          
          if (schedulesError) throw schedulesError;
          freshData = schedulesData || [];
          break;

        case 'weekly_summaries':
          const { data: summariesData, error: summariesError } = await supabase
            .from('weekly_summaries')
            .select('*')
            .in('id', group.entries.map(e => e.data.id).filter(Boolean));
          
          if (summariesError) throw summariesError;
          freshData = summariesData || [];
          break;

        default:
          console.warn(`No sync handler for table: ${group.table}`);
          return;
      }

      // Update cache with fresh data
      if (freshData && freshData.length > 0) {
        await this.smartCacheData(group.table, freshData, 'high');
        console.log(`🔄 Synced ${freshData.length} items for table: ${group.table}`);
      }
    } catch (error) {
      console.error(`Smart sync failed for table ${group.table}:`, error);
    }
  }

  async smartCacheData(
    table: string, 
    data: any[], 
    priority: 'high' | 'medium' | 'low' = 'medium',
    ttl: number = 24 * 60 * 60 * 1000
  ): Promise<void> {
    const entries = cacheManager.getCachedEntries();
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

    cacheManager.saveCachedEntries([...filteredEntries, ...newEntries]);
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

    // Restart sync with new config
    this.initializeSmartSync();
  }

  cleanup(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

export const smartSyncManager = new SmartSyncManager();
export type { SmartSyncConfig };
