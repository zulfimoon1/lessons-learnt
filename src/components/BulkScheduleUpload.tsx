
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadIcon, FileTextIcon, CheckCircleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { classScheduleService } from "@/services/classScheduleService";

interface BulkScheduleUploadProps {
  teacher: {
    id: string;
    school: string;
  };
  onUploadComplete: () => void;
}

const BulkScheduleUpload = ({ teacher, onUploadComplete }: BulkScheduleUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const schedules = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const schedule = {
        teacher_id: teacher.id,
        school: teacher.school,
        grade: values[headers.indexOf('grade')] || '',
        subject: values[headers.indexOf('subject')] || '',
        lesson_topic: values[headers.indexOf('lesson_topic')] || '',
        class_date: values[headers.indexOf('class_date')] || '',
        class_time: values[headers.indexOf('class_time')] || '',
        duration_minutes: parseInt(values[headers.indexOf('duration_minutes')] || '60'),
        description: values[headers.indexOf('description')] || ''
      };

      if (schedule.grade && schedule.subject && schedule.lesson_topic && schedule.class_date && schedule.class_time) {
        schedules.push(schedule);
      }
    }

    return schedules;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const csvText = await file.text();
      const schedules = parseCSV(csvText);

      if (schedules.length === 0) {
        toast({
          title: "No valid schedules found",
          description: "Please check your CSV format",
          variant: "destructive",
        });
        return;
      }

      console.log('Uploading schedules:', schedules);
      const result = await classScheduleService.bulkCreateSchedules(schedules);

      if (result.data) {
        setUploadResult({ success: result.data.length, errors: [] });
        toast({
          title: t('upload.uploadComplete'),
          description: `Successfully uploaded ${result.data.length} class schedules`,
        });
        onUploadComplete();
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload schedules. Please check your file format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `grade,subject,lesson_topic,class_date,class_time,duration_minutes,description
10A,Mathematics,Algebra Basics,2024-07-01,09:00,60,Introduction to algebraic expressions
10A,Physics,Newton's Laws,2024-07-02,10:00,60,Understanding force and motion
9B,English,Shakespeare,2024-07-03,11:00,45,Romeo and Juliet analysis`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="w-5 h-5" />
          {t('upload.bulkUpload')}
        </CardTitle>
        <CardDescription>
          Upload multiple class schedules using a CSV file. Download the template to see the required format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileTextIcon className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div>
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-1"
          />
        </div>

        {file && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        {uploadResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="font-medium">{t('upload.uploadComplete')}</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Successfully uploaded {uploadResult.success} class schedules
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Schedules"}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>CSV Format Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Headers: grade, subject, lesson_topic, class_date, class_time, duration_minutes, description</li>
            <li>Date format: YYYY-MM-DD (e.g., 2024-07-01)</li>
            <li>Time format: HH:MM (e.g., 09:00)</li>
            <li>Duration in minutes (e.g., 60)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkScheduleUpload;
