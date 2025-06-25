
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Database, Globe, Monitor, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface CacheStats {
  hitRate: number;
  totalRequests: number;
  cacheSize: string;
  evictions: number;
}

interface DatabaseMetric {
  queryTime: number;
  connectionPool: number;
  activeConnections: number;
  slowQueries: number;
}

interface PerformanceOptimizerProps {
  className?: string;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ className }) => {
  const { t } = useLanguage();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimized, setLastOptimized] = useState<Date | null>(null);

  // Mock performance data
  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Page Load Time',
      value: 1.2,
      unit: 's',
      status: 'good',
      trend: 'down',
      description: 'Average time to load pages'
    },
    {
      name: 'Time to Interactive',
      value: 2.8,
      unit: 's',
      status: 'warning',
      trend: 'up',
      description: 'Time until page becomes interactive'
    },
    {
      name: 'Bundle Size',
      value: 245,
      unit: 'KB',
      status: 'good',
      trend: 'stable',
      description: 'Total JavaScript bundle size'
    },
    {
      name: 'Memory Usage',
      value: 89,
      unit: 'MB',
      status: 'warning',
      trend: 'up',
      description: 'Current memory consumption'
    }
  ]);

  const [cacheStats] = useState<CacheStats>({
    hitRate: 87.5,
    totalRequests: 12459,
    cacheSize: '2.4 GB',
    evictions: 23
  });

  const [databaseMetrics] = useState<DatabaseMetric>({
    queryTime: 45,
    connectionPool: 20,
    activeConnections: 8,
    slowQueries: 3
  });

  const overallScore = useMemo(() => {
    const scores = performanceMetrics.map(metric => {
      switch (metric.status) {
        case 'good': return 100;
        case 'warning': return 70;
        case 'critical': return 30;
        default: return 50;
      }
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [performanceMetrics]);

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsOptimizing(false);
    setLastOptimized(new Date());
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: PerformanceMetric['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'good': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            {t('performance.title') || 'Performance Optimizer'}
          </h2>
          <p className="text-muted-foreground">
            {t('performance.subtitle') || 'Monitor and optimize platform performance'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastOptimized && (
            <span className="text-sm text-muted-foreground">
              Last optimized: {lastOptimized.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={runOptimization} 
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isOptimizing && 'animate-spin')} />
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Performance Score</h3>
              <p className="text-muted-foreground">Based on key performance metrics</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{overallScore}</div>
              <Progress value={overallScore} className="w-24 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Monitor className="w-4 h-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="cache">
            <Database className="w-4 h-4 mr-2" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="w-4 h-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="w-4 h-4 mr-2" />
            Optimization
          </TabsTrigger>
        </TabsList>

        {/* Performance Metrics */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{metric.name}</h4>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {metric.value}{metric.unit}
                        </span>
                        <span>{getTrendIcon(metric.trend)}</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(metric.status)} className="text-xs">
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cache Statistics */}
        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Hit Rate</span>
                    <span className="font-bold text-green-600">{cacheStats.hitRate}%</span>
                  </div>
                  <Progress value={cacheStats.hitRate} />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Requests</span>
                      <div className="font-bold">{cacheStats.totalRequests.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cache Size</span>
                      <div className="font-bold">{cacheStats.cacheSize}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cache Evictions</span>
                    <Badge variant={cacheStats.evictions > 50 ? "destructive" : "default"}>
                      {cacheStats.evictions}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Preload Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Performance */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Query Time</span>
                    <span className={cn(
                      'font-bold',
                      databaseMetrics.queryTime > 100 ? 'text-red-600' : 'text-green-600'
                    )}>
                      {databaseMetrics.queryTime}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Slow Queries</span>
                    <Badge variant={databaseMetrics.slowQueries > 5 ? "destructive" : "default"}>
                      {databaseMetrics.slowQueries}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Connections</span>
                    <span className="font-bold">
                      {databaseMetrics.activeConnections}/{databaseMetrics.connectionPool}
                    </span>
                  </div>
                  <Progress 
                    value={(databaseMetrics.activeConnections / databaseMetrics.connectionPool) * 100} 
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    Pool utilization: {Math.round((databaseMetrics.activeConnections / databaseMetrics.connectionPool) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Recommendations */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="space-y-4">
            {[
              {
                title: 'Enable Gzip Compression',
                description: 'Reduce bandwidth usage by 60-70%',
                impact: 'High',
                effort: 'Low',
                implemented: true
              },
              {
                title: 'Implement CDN Caching',
                description: 'Improve global load times',
                impact: 'High',
                effort: 'Medium',
                implemented: false
              },
              {
                title: 'Optimize Database Queries',
                description: 'Add indexes for frequent queries',
                impact: 'Medium',
                effort: 'Medium',
                implemented: false
              },
              {
                title: 'Lazy Load Components',
                description: 'Reduce initial bundle size',
                impact: 'Medium',
                effort: 'Low',
                implemented: true
              }
            ].map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {recommendation.implemented ? 
                          <span className="text-green-600">✓</span> : 
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        }
                        {recommendation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Impact: {recommendation.impact}
                      </Badge>
                      <Badge variant="outline">
                        Effort: {recommendation.effort}
                      </Badge>
                      {recommendation.implemented && (
                        <Badge variant="default">Implemented</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOptimizer;
