
interface CachedDataEntry {
  id: string;
  table: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
  syncState: 'fresh' | 'stale' | 'expired';
}

export class CacheManager {
  private readonly CACHE_KEY = 'enhanced_offline_cache';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  getCachedEntries(): CachedDataEntry[] {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    } catch (error) {
      console.error('Error reading enhanced cache:', error);
      return [];
    }
  }

  saveCachedEntries(entries: CachedDataEntry[]): void {
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

  getCacheStats() {
    const entries = this.getCachedEntries();
    
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

  clearExpiredCache(): number {
    const entries = this.getCachedEntries();
    const now = Date.now();
    const validEntries = entries.filter(entry => entry.expiresAt > now);
    const removedCount = entries.length - validEntries.length;
    
    this.saveCachedEntries(validEntries);
    console.log(`🧹 Cleared ${removedCount} expired cache entries`);
    
    return removedCount;
  }
}

export const cacheManager = new CacheManager();
