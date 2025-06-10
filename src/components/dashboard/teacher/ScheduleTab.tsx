
import React from "react";
import ClassScheduleForm from "@/components/ClassScheduleForm";

interface ScheduleTabProps {
  teacher: any;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      <ClassScheduleForm teacher={teacher} />
    </div>
  );
};

export default ScheduleTab;
