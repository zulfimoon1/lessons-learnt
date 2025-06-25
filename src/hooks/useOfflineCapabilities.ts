
import { useState, useEffect, useCallback } from 'react';
import { offlineDataService } from '@/services/offlineDataService';

interface UseOfflineCapabilitiesReturn {
  isOnline: boolean;
  syncStatus: {
    isOnline: boolean;
    lastSync: Date | null;
    pendingOperations: number;
    isSyncing: boolean;
  };
  storeOfflineOperation: (table: string, data: any, operation: 'insert' | 'update' | 'delete') => Promise<void>;
  getCachedData: (table: string) => any[];
  cacheData: (table: string, data: any[]) => void;
  syncPendingOperations: () => Promise<{ success: boolean; synced: number; errors: string[] }>;
  clearOfflineData: () => void;
}

export const useOfflineCapabilities = (): UseOfflineCapabilitiesReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(offlineDataService.getSyncStatus());

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    setSyncStatus(prev => ({ ...prev, isOnline: online }));
  }, []);

  // Handle connection restored
  const handleConnectionRestored = useCallback(async () => {
    console.log('🌐 Connection restored, attempting to sync...');
    await offlineDataService.forceSyncOnReconnect();
    setSyncStatus(offlineDataService.getSyncStatus());
  }, []);

  // Store offline operation wrapper
  const storeOfflineOperation = useCallback(async (table: string, data: any, operation: 'insert' | 'update' | 'delete') => {
    await offlineDataService.storeOfflineOperation(table, data, operation);
    setSyncStatus(offlineDataService.getSyncStatus());
  }, []);

  // Sync pending operations wrapper
  const syncPendingOperations = useCallback(async () => {
    const result = await offlineDataService.syncPendingOperations();
    setSyncStatus(offlineDataService.getSyncStatus());
    return result;
  }, []);

  // Get cached data wrapper
  const getCachedData = useCallback((table: string) => {
    return offlineDataService.getCachedData(table);
  }, []);

  // Cache data wrapper
  const cacheData = useCallback((table: string, data: any[]) => {
    offlineDataService.cacheData(table, data);
  }, []);

  // Clear offline data wrapper
  const clearOfflineData = useCallback(() => {
    offlineDataService.clearOfflineData();
    setSyncStatus(offlineDataService.getSyncStatus());
  }, []);

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('online', handleConnectionRestored);

    // Initial sync status update
    setSyncStatus(offlineDataService.getSyncStatus());

    // Periodic sync status update
    const interval = setInterval(() => {
      setSyncStatus(offlineDataService.getSyncStatus());
    }, 30000); // Update every 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('online', handleConnectionRestored);
      clearInterval(interval);
    };
  }, [updateOnlineStatus, handleConnectionRestored]);

  return {
    isOnline,
    syncStatus,
    storeOfflineOperation,
    getCachedData,
    cacheData,
    syncPendingOperations,
    clearOfflineData
  };
};

export default useOfflineCapabilities;
