
import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Calendar, School, AlertTriangle } from "lucide-react";

interface FilterOptions {
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'reviewed' | 'unreviewed';
  school: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface MentalHealthAlertFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableSchools: string[];
  alertCounts: {
    total: number;
    filtered: number;
  };
}

const MentalHealthAlertFilters: React.FC<MentalHealthAlertFiltersProps> = memo(({
  filters,
  onFiltersChange,
  availableSchools,
  alertCounts
}) => {
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      severity: 'all',
      status: 'all',
      school: 'all',
      dateRange: 'all'
    });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.severity !== 'all' || 
                          filters.status !== 'all' || 
                          filters.school !== 'all' || 
                          filters.dateRange !== 'all';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Alert Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs h-6 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Severity Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Severity Level
            </label>
            <Select 
              value={filters.severity} 
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low (1-3)</SelectItem>
                <SelectItem value="medium">Medium (4-6)</SelectItem>
                <SelectItem value="high">High (7-8)</SelectItem>
                <SelectItem value="critical">Critical (9-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Review Status
            </label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unreviewed">Unreviewed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* School Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              <School className="w-3 h-3 inline mr-1" />
              School
            </label>
            <Select 
              value={filters.school} 
              onValueChange={(value) => handleFilterChange('school', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {availableSchools.map(school => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Date Range
            </label>
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Showing {alertCounts.filtered} of {alertCounts.total} alerts
            </span>
          </div>
          
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MentalHealthAlertFilters.displayName = 'MentalHealthAlertFilters';

export default MentalHealthAlertFilters;
