
import { useState, useEffect, useCallback } from 'react';

interface TooltipConfig {
  id: string;
  title: string;
  description: string;
  feature: 'new' | 'advanced' | 'tip';
  demoContent?: React.ReactNode;
  shortcuts?: string[];
  triggerCondition?: () => boolean;
  priority: number;
  maxShows?: number;
}

interface TooltipState {
  [tooltipId: string]: {
    shown: number;
    dismissed: boolean;
    tried: boolean;
  };
}

export const useFeatureTooltips = (tooltips: TooltipConfig[]) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [queuedTooltips, setQueuedTooltips] = useState<string[]>([]);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('feature-tooltips-state');
    if (savedState) {
      try {
        setTooltipState(JSON.parse(savedState));
      } catch (error) {
        console.warn('Failed to load tooltip state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (Object.keys(tooltipState).length > 0) {
      localStorage.setItem('feature-tooltips-state', JSON.stringify(tooltipState));
    }
  }, [tooltipState]);

  const updateTooltipState = useCallback((tooltipId: string, updates: Partial<TooltipState[string]>) => {
    setTooltipState(prev => ({
      ...prev,
      [tooltipId]: {
        shown: 0,
        dismissed: false,
        tried: false,
        ...prev[tooltipId],
        ...updates
      }
    }));
  }, []);

  const shouldShowTooltip = useCallback((tooltip: TooltipConfig): boolean => {
    const state = tooltipState[tooltip.id];
    
    // Don't show if dismissed or max shows reached
    if (state?.dismissed || (tooltip.maxShows && state?.shown >= tooltip.maxShows)) {
      return false;
    }
    
    // Check trigger condition if provided
    if (tooltip.triggerCondition && !tooltip.triggerCondition()) {
      return false;
    }
    
    return true;
  }, [tooltipState]);

  const queueTooltip = useCallback((tooltipId: string) => {
    const tooltip = tooltips.find(t => t.id === tooltipId);
    if (!tooltip || !shouldShowTooltip(tooltip)) return;
    
    setQueuedTooltips(prev => {
      if (prev.includes(tooltipId)) return prev;
      
      // Insert in priority order
      const newQueue = [...prev, tooltipId];
      return newQueue.sort((a, b) => {
        const tooltipA = tooltips.find(t => t.id === a);
        const tooltipB = tooltips.find(t => t.id === b);
        return (tooltipB?.priority || 0) - (tooltipA?.priority || 0);
      });
    });
  }, [tooltips, shouldShowTooltip]);

  const showNextTooltip = useCallback(() => {
    if (activeTooltip || queuedTooltips.length === 0) return;
    
    const nextTooltipId = queuedTooltips[0];
    setActiveTooltip(nextTooltipId);
    setQueuedTooltips(prev => prev.slice(1));
    
    // Mark as shown
    updateTooltipState(nextTooltipId, {
      shown: (tooltipState[nextTooltipId]?.shown || 0) + 1
    });
  }, [activeTooltip, queuedTooltips, tooltipState, updateTooltipState]);

  const dismissTooltip = useCallback((tooltipId: string, permanent: boolean = false) => {
    setActiveTooltip(null);
    
    if (permanent) {
      updateTooltipState(tooltipId, { dismissed: true });
    }
    
    // Show next tooltip after a short delay
    setTimeout(showNextTooltip, 500);
  }, [showNextTooltip, updateTooltipState]);

  const markTooltipTried = useCallback((tooltipId: string) => {
    updateTooltipState(tooltipId, { tried: true });
  }, [updateTooltipState]);

  // Auto-show next tooltip when queue changes
  useEffect(() => {
    if (!activeTooltip && queuedTooltips.length > 0) {
      const timer = setTimeout(showNextTooltip, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeTooltip, queuedTooltips, showNextTooltip]);

  // Check for tooltips to show on mount and when conditions change
  useEffect(() => {
    tooltips.forEach(tooltip => {
      if (shouldShowTooltip(tooltip)) {
        queueTooltip(tooltip.id);
      }
    });
  }, [tooltips, shouldShowTooltip, queueTooltip]);

  const resetTooltips = useCallback(() => {
    setTooltipState({});
    setActiveTooltip(null);
    setQueuedTooltips([]);
    localStorage.removeItem('feature-tooltips-state');
  }, []);

  const getCurrentTooltip = () => {
    if (!activeTooltip) return null;
    return tooltips.find(t => t.id === activeTooltip) || null;
  };

  return {
    activeTooltip,
    currentTooltip: getCurrentTooltip(),
    queuedCount: queuedTooltips.length,
    queueTooltip,
    dismissTooltip,
    markTooltipTried,
    resetTooltips,
    tooltipState
  };
};
