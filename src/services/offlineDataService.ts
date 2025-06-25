
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

// Define valid table names that we support for offline operations
type ValidTableName = 'feedback' | 'weekly_summaries' | 'mental_health_alerts' | 'class_schedules' | 'students' | 'teachers';

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

  // Sync a single operation with proper type safety
  private async syncSingleOperation(operation: OfflineData): Promise<void> {
    const { table, data, operation: op } = operation;

    // Type-safe table operations
    switch (table as ValidTableName) {
      case 'feedback':
        await this.syncFeedbackOperation(op, data);
        break;
      case 'weekly_summaries':
        await this.syncWeeklySummariesOperation(op, data);
        break;
      case 'mental_health_alerts':
        await this.syncMentalHealthAlertsOperation(op, data);
        break;
      case 'class_schedules':
        await this.syncClassSchedulesOperation(op, data);
        break;
      case 'students':
        await this.syncStudentsOperation(op, data);
        break;
      case 'teachers':
        await this.syncTeachersOperation(op, data);
        break;
      default:
        throw new Error(`Unsupported table for sync: ${table}`);
    }
  }

  // Type-safe sync operations for each table
  private async syncFeedbackOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('feedback').insert(data);
        break;
      case 'update':
        await supabase.from('feedback').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('feedback').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async syncWeeklySummariesOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('weekly_summaries').insert(data);
        break;
      case 'update':
        await supabase.from('weekly_summaries').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('weekly_summaries').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async syncMentalHealthAlertsOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('mental_health_alerts').insert(data);
        break;
      case 'update':
        await supabase.from('mental_health_alerts').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('mental_health_alerts').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async syncClassSchedulesOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('class_schedules').insert(data);
        break;
      case 'update':
        await supabase.from('class_schedules').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('class_schedules').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async syncStudentsOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('students').insert(data);
        break;
      case 'update':
        await supabase.from('students').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('students').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async syncTeachersOperation(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'insert':
        await supabase.from('teachers').insert(data);
        break;
      case 'update':
        await supabase.from('teachers').update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from('teachers').delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
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
