
import React from "react";
import WeeklySummary from "@/components/WeeklySummary";

interface WeeklySummaryTabProps {
  student: any;
}

const WeeklySummaryTab: React.FC<WeeklySummaryTabProps> = ({ student }) => {
  return (
    <div className="space-y-6">
      <WeeklySummary student={student} />
    </div>
  );
};

export default WeeklySummaryTab;
