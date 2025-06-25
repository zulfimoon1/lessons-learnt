
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mail, Clock } from 'lucide-react';

interface ExportProgress {
  stage: string;
  progress: number;
  completed: boolean;
}

interface DataExportProgressProps {
  progress: ExportProgress;
}

const DataExportProgress: React.FC<DataExportProgressProps> = ({ progress }) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{progress.stage}</span>
            <span className="text-sm text-gray-600">{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="w-full" />
          {progress.progress > 90 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Mail className="w-4 h-4" />
              <span>Sending confirmation email...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportProgress;
