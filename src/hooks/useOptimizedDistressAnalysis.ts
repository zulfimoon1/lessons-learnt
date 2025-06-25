
import { useState, useCallback, useMemo } from 'react';
import { useDebounce, useOptimizedFilter } from './usePerformanceOptimization';
import { multiLanguageDistressService, DistressAnalysis } from '@/services/multiLanguageDistressService';

interface CachedAnalysis {
  text: string;
  analysis: DistressAnalysis;
  timestamp: number;
}

export const useOptimizedDistressAnalysis = () => {
  const [cache, setCache] = useState<Map<string, CachedAnalysis>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisQueue, setAnalysisQueue] = useState<string[]>([]);

  // Cache TTL: 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  const generateCacheKey = useCallback((text: string): string => {
    return btoa(text.toLowerCase().trim()).slice(0, 32);
  }, []);

  const getCachedAnalysis = useCallback((text: string): DistressAnalysis | null => {
    const key = generateCacheKey(text);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.analysis;
    }
    
    if (cached) {
      // Remove expired cache entry
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    }
    
    return null;
  }, [cache, generateCacheKey]);

  const setCachedAnalysis = useCallback((text: string, analysis: DistressAnalysis) => {
    const key = generateCacheKey(text);
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, {
        text,
        analysis,
        timestamp: Date.now()
      });
      return newCache;
    });
  }, [generateCacheKey]);

  const analyzeTextOptimized = useCallback(async (text: string): Promise<DistressAnalysis | null> => {
    if (!text || text.trim().length < 10) {
      return null;
    }

    // Check cache first
    const cached = getCachedAnalysis(text);
    if (cached) {
      return cached;
    }

    setIsAnalyzing(true);
    try {
      const analysis = multiLanguageDistressService.analyzeText(text);
      setCachedAnalysis(text, analysis);
      return analysis;
    } catch (error) {
      console.error('Optimized distress analysis error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [getCachedAnalysis, setCachedAnalysis]);

  // Debounced analysis for real-time input
  const debouncedAnalyze = useDebounce(analyzeTextOptimized, 500);

  const batchAnalyze = useCallback(async (texts: string[]): Promise<DistressAnalysis[]> => {
    const results: DistressAnalysis[] = [];
    
    // Process in chunks to avoid overwhelming the system
    const chunkSize = 5;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(text => analyzeTextOptimized(text))
      );
      results.push(...chunkResults.filter(Boolean) as DistressAnalysis[]);
    }
    
    return results;
  }, [analyzeTextOptimized]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const getCacheStats = useMemo(() => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    cache.forEach(entry => {
      if (now - entry.timestamp < CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      totalEntries: cache.size,
      validEntries,
      expiredEntries,
      hitRate: cache.size > 0 ? (validEntries / cache.size) * 100 : 0
    };
  }, [cache]);

  return {
    analyzeTextOptimized,
    debouncedAnalyze,
    batchAnalyze,
    isAnalyzing,
    clearCache,
    getCacheStats
  };
};

export default useOptimizedDistressAnalysis;
