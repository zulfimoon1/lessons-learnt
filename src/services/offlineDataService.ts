
import { supabase } from '@/integrations/supabase/client';

interface OfflineData {
  id: string;
  table: string;
  data: any;
  operation: 'insert' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  isSyncing: boolean;
}

class OfflineDataService {
  private readonly STORAGE_KEY = 'offline_data';
  private readonly SYNC_STATUS_KEY = 'sync_status';
  private readonly MAX_OFFLINE_STORAGE = 1000; // Maximum items to store offline

  // Get offline data from localStorage
  private getOfflineData(): OfflineData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading offline data:', error);
      return [];
    }
  }

  // Save offline data to localStorage
  private saveOfflineData(data: OfflineData[]): void {
    try {
      // Limit storage to prevent localStorage overflow
      const limitedData = data.slice(-this.MAX_OFFLINE_STORAGE);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    try {
      const status = localStorage.getItem(this.SYNC_STATUS_KEY);
      return status ? JSON.parse(status) : {
        isOnline: navigator.onLine,
        lastSync: null,
        pendingOperations: 0,
        isSyncing: false
      };
    } catch (error) {
      return {
        isOnline: navigator.onLine,
        lastSync: null,
        pendingOperations: 0,
        isSyncing: false
      };
    }
  }

  // Update sync status
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    try {
      const currentStatus = this.getSyncStatus();
      const newStatus = { ...currentStatus, ...updates };
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  // Store data for offline use
  async storeOfflineOperation(table: string, data: any, operation: 'insert' | 'update' | 'delete'): Promise<void> {
    const offlineData = this.getOfflineData();
    const newOperation: OfflineData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table,
      data,
      operation,
      timestamp: Date.now(),
      synced: false
    };

    offlineData.push(newOperation);
    this.saveOfflineData(offlineData);
    this.updateSyncStatus({ pendingOperations: offlineData.filter(item => !item.synced).length });
  }

  // Get cached data for offline use
  getCachedData(table: string): any[] {
    try {
      const cacheKey = `cached_${table}`;
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading cached data:', error);
      return [];
    }
  }

  // Cache data for offline use
  cacheData(table: string, data: any[]): void {
    try {
      const cacheKey = `cached_${table}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Sync pending operations when online
  async syncPendingOperations(): Promise<{ success: boolean; synced: number; errors: string[] }> {
    if (!navigator.onLine) {
      return { success: false, synced: 0, errors: ['Device is offline'] };
    }

    this.updateSyncStatus({ isSyncing: true });
    const offlineData = this.getOfflineData();
    const pendingOperations = offlineData.filter(item => !item.synced);
    
    let syncedCount = 0;
    const errors: string[] = [];

    for (const operation of pendingOperations) {
      try {
        await this.syncSingleOperation(operation);
        operation.synced = true;
        syncedCount++;
      } catch (error) {
        console.error('Error syncing operation:', error);
        errors.push(`Failed to sync ${operation.operation} on ${operation.table}: ${error}`);
      }
    }

    // Update stored data
    this.saveOfflineData(offlineData);
    this.updateSyncStatus({
      isSyncing: false,
      lastSync: new Date(),
      pendingOperations: offlineData.filter(item => !item.synced).length
    });

    return {
      success: errors.length === 0,
      synced: syncedCount,
      errors
    };
  }

  // Sync a single operation
  private async syncSingleOperation(operation: OfflineData): Promise<void> {
    const { table, data, operation: op } = operation;

    switch (op) {
      case 'insert':
        await supabase.from(table).insert(data);
        break;
      case 'update':
        await supabase.from(table).update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from(table).delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${op}`);
    }
  }

  // Check if device is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Clear offline data (useful for testing or reset)
  clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SYNC_STATUS_KEY);
    
    // Clear all cached data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cached_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get pending operations count
  getPendingOperationsCount(): number {
    const offlineData = this.getOfflineData();
    return offlineData.filter(item => !item.synced).length;
  }

  // Force sync when connection is restored
  async forceSyncOnReconnect(): Promise<void> {
    if (this.isOnline() && this.getPendingOperationsCount() > 0) {
      console.log('🔄 Connection restored, syncing pending operations...');
      await this.syncPendingOperations();
    }
  }
}

export const offlineDataService = new OfflineDataService();
