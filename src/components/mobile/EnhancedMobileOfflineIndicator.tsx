
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  Trash2,
  Settings,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useEnhancedOffline } from '@/hooks/useEnhancedOffline';

interface EnhancedMobileOfflineIndicatorProps {
  tables?: string[];
  compact?: boolean;
  showControls?: boolean;
}

const EnhancedMobileOfflineIndicator: React.FC<EnhancedMobileOfflineIndicatorProps> = ({
  tables = ['feedback', 'mental_health_alerts', 'class_schedules'],
  compact = false,
  showControls = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    getOfflineCapabilities,
    clearExpiredCache,
    updateSyncConfig,
    cacheStats
  } = useEnhancedOffline({
    tables,
    enableSmartSync: true,
    enablePrefetch: true
  });

  const capabilities = getOfflineCapabilities();
  const healthScore = capabilities.cacheHealthScore;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCleanCache = () => {
    const removed = clearExpiredCache();
    // Show toast or feedback about removed items
    console.log(`Cleaned ${removed} expired cache entries`);
  };

  const handleSyncSettings = () => {
    // Toggle sync frequency for mobile optimization
    updateSyncConfig({
      syncInterval: capabilities.isOnline ? 15000 : 60000, // Faster when online
      batchSize: capabilities.isOnline ? 20 : 5 // Smaller batches when offline
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg">
        {capabilities.isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-orange-600" />
        )}
        
        <Badge variant={getHealthVariant(healthScore)} className="text-xs">
          {healthScore}%
        </Badge>
        
        <span className="text-xs text-gray-600">
          {cacheStats.totalEntries} items
        </span>
        
        {capabilities.hasStaleData && (
          <Clock className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Enhanced Offline Status
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant={capabilities.isOnline ? 'default' : 'secondary'}>
              {capabilities.isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            
            {capabilities.smartSyncEnabled && (
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Smart Sync
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cache Health Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Cache Health</span>
            <span className={`text-sm font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}%
            </span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Total Entries</div>
            <div className="text-gray-600">{cacheStats.totalEntries}</div>
          </div>
          <div>
            <div className="font-medium">Cache Size</div>
            <div className="text-gray-600">{formatCacheSize(cacheStats.cacheSize)}</div>
          </div>
          <div>
            <div className="font-medium">Fresh Data</div>
            <div className="text-green-600">{cacheStats.freshEntries}</div>
          </div>
          <div>
            <div className="font-medium">Stale Data</div>
            <div className="text-yellow-600">{cacheStats.staleEntries}</div>
          </div>
        </div>

        {/* Sync Status */}
        {capabilities.lastPrefetch && (
          <div className="text-xs text-gray-600">
            Last sync: {capabilities.lastPrefetch.toLocaleTimeString()}
          </div>
        )}

        {/* Data Quality Indicators */}
        {(capabilities.hasStaleData || capabilities.hasExpiredData) && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Data Quality Alert</span>
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              {capabilities.hasExpiredData && (
                <div>• {cacheStats.expiredEntries} expired entries</div>
              )}
              {capabilities.hasStaleData && (
                <div>• {cacheStats.staleEntries} stale entries</div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanCache}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clean Cache
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncSettings}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Optimize
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        )}

        {/* Detailed Statistics */}
        {showDetails && (
          <div className="border-t pt-3 space-y-2">
            <h4 className="text-sm font-medium">Priority Distribution</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-700">High</div>
                <div className="text-red-600">{cacheStats.highPriority}</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-700">Medium</div>
                <div className="text-yellow-600">{cacheStats.mediumPriority}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-700">Low</div>
                <div className="text-green-600">{cacheStats.lowPriority}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMobileOfflineIndicator;
