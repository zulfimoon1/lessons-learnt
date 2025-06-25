
interface CachedDataEntry {
  id: string;
  table: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
  syncState: 'fresh' | 'stale' | 'expired';
}

class CacheManager {
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
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : now,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : now
    };
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

  private getCacheSize(): number {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? new Blob([cache]).size : 0;
    } catch {
      return 0;
    }
  }
}

export const cacheManager = new CacheManager();
export type { CachedDataEntry };
