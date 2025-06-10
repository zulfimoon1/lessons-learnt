
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
};

export const TabContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />
    </div>
  );
};
