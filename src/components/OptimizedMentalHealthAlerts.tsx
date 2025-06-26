
import React, { useState, useMemo } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { useOptimizedMentalHealthAlerts } from "@/hooks/useOptimizedMentalHealthAlerts";
import { useMentalHealthFilters } from "@/hooks/useMentalHealthFilters";
import MobileOptimizedMentalHealthAlerts from "@/components/mental-health/MobileOptimizedMentalHealthAlerts";
import MentalHealthPerformanceOptimizer from "@/components/performance/MentalHealthPerformanceOptimizer";
import MentalHealthAlertFilters from "@/components/mental-health/MentalHealthAlertFilters";
import LazyLoadWrapper from "@/components/performance/LazyLoadWrapper";
import MentalHealthAlerts from "@/components/MentalHealthAlerts";

const OptimizedMentalHealthAlerts = () => {
  const isMobile = useIsMobile();
  const { alerts, isLoading, isAuthorized, refreshAlerts, markAsReviewed, alertStats } = useOptimizedMentalHealthAlerts();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const {
    filters,
    updateFilters,
    filteredAlerts,
    availableSchools,
    alertCounts
  } = useMentalHealthFilters(alerts);

  const handleRefresh = () => {
    refreshAlerts();
    setLastUpdated(new Date());
  };

  // Mobile-first approach
  if (isMobile) {
    return (
      <LazyLoadWrapper>
        <MobileOptimizedMentalHealthAlerts 
          alerts={filteredAlerts}
          isLoading={isLoading}
          isAuthorized={isAuthorized}
          markAsReviewed={markAsReviewed}
          alertStats={alertStats}
        />
      </LazyLoadWrapper>
    );
  }

  // Desktop version with enhanced features
  return (
    <LazyLoadWrapper>
      <div className="space-y-4">
        {/* Performance Summary */}
        <MentalHealthPerformanceOptimizer
          alerts={filteredAlerts}
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
        />

        {/* Filters */}
        <MentalHealthAlertFilters
          filters={filters}
          onFiltersChange={updateFilters}
          availableSchools={availableSchools}
          alertCounts={alertCounts}
        />

        {/* Main Alerts Component */}
        <div className="min-h-[400px]">
          <MentalHealthAlerts 
            alerts={filteredAlerts}
            isLoading={isLoading}
            isAuthorized={isAuthorized}
            markAsReviewed={markAsReviewed}
          />
        </div>
      </div>
    </LazyLoadWrapper>
  );
};

export default OptimizedMentalHealthAlerts;
