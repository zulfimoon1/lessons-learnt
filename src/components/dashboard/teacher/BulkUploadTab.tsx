
import React from "react";
import BulkScheduleUpload from "@/components/BulkScheduleUpload";

interface BulkUploadTabProps {
  teacher: any;
  onUploadComplete: () => void;
}

const BulkUploadTab: React.FC<BulkUploadTabProps> = ({ teacher, onUploadComplete }) => {
  return (
    <div className="space-y-6">
      <BulkScheduleUpload 
        teacher={teacher} 
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
};

export default BulkUploadTab;
