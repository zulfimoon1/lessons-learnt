
import { useState, useMemo, useCallback } from 'react';
import type { MentalHealthAlert } from '@/types/mentalHealth';

interface FilterOptions {
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'reviewed' | 'unreviewed';
  school: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export const useMentalHealthFilters = (alerts: MentalHealthAlert[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    severity: 'all',
    status: 'all',
    school: 'all',
    dateRange: 'all'
  });

  // Get unique schools for filter options
  const availableSchools = useMemo(() => {
    const schools = new Set(alerts.map(alert => alert.school));
    return Array.from(schools).sort();
  }, [alerts]);

  // Apply filters to alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Severity filter
      if (filters.severity !== 'all') {
        const severity = alert.severity_level;
        switch (filters.severity) {
          case 'low':
            if (severity > 3) return false;
            break;
          case 'medium':
            if (severity < 4 || severity > 6) return false;
            break;
          case 'high':
            if (severity < 7 || severity > 8) return false;
            break;
          case 'critical':
            if (severity < 9) return false;
            break;
        }
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'reviewed' && !alert.is_reviewed) return false;
        if (filters.status === 'unreviewed' && alert.is_reviewed) return false;
      }

      // School filter
      if (filters.school !== 'all' && alert.school !== filters.school) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const alertDate = new Date(alert.created_at);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (alertDate < today) return false;
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (alertDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (alertDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [alerts, filters]);

  // Alert counts for display
  const alertCounts = useMemo(() => ({
    total: alerts.length,
    filtered: filteredAlerts.length
  }), [alerts.length, filteredAlerts.length]);

  const updateFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    updateFilters,
    filteredAlerts,
    availableSchools,
    alertCounts
  };
};
