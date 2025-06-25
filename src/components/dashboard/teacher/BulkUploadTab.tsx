
import React from "react";
import BulkScheduleUpload from "@/components/BulkScheduleUpload";

interface BulkUploadTabProps {
  teacher: any;
  onUploadComplete?: () => void;
}

const BulkUploadTab: React.FC<BulkUploadTabProps> = ({ teacher, onUploadComplete }) => {
  const handleUploadComplete = () => {
    console.log('Upload completed for teacher:', teacher.id);
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="space-y-6">
      <BulkScheduleUpload 
        teacher={teacher} 
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default BulkUploadTab;
