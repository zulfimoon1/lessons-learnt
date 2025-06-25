
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useOfflineCapabilities } from '@/hooks/useOfflineCapabilities';
import { useToast } from '@/hooks/use-toast';

interface SyncStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  className,
  showDetails = false
}) => {
  const { toast } = useToast();
  const { 
    isOnline, 
    syncStatus, 
    syncPendingOperations 
  } = useOfflineCapabilities();

  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "No Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await syncPendingOperations();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced ${result.synced} items.`,
        });
      } else {
        toast({
          title: "Sync Issues",
          description: `Synced ${result.synced} items, ${result.errors.length} failed.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (!isOnline) {
      return <CloudOff className="w-4 h-4" />;
    }
    
    if (syncStatus.pendingOperations > 0) {
      return <Clock className="w-4 h-4" />;
    }
    
    return <Cloud className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) return "default";
    if (!isOnline) return "destructive";
    if (syncStatus.pendingOperations > 0) return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return "Syncing...";
    if (!isOnline) return "Offline";
    if (syncStatus.pendingOperations > 0) return `${syncStatus.pendingOperations} pending`;
    return "Online";
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getStatusColor()} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Sync Status</h3>
        <Badge variant={getStatusColor()} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Connection:</span>
          <span className={isOnline ? "text-green-600" : "text-red-600"}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {syncStatus.pendingOperations > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Pending items:</span>
            <span className="text-orange-600">{syncStatus.pendingOperations}</span>
          </div>
        )}

        {syncStatus.lastSync && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last sync:</span>
            <span className="text-gray-800">
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </span>
          </div>
        )}

        {syncStatus.isSyncing && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing data...</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {isOnline && syncStatus.pendingOperations > 0 && !syncStatus.isSyncing && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </Button>
        )}
        
        {!isOnline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4" />
            Changes will sync when online
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
