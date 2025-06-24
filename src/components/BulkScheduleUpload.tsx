
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
        title: t('upload.invalidFileType'),
        description: t('upload.selectCsvFileError'),
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
          title: t('upload.noValidSchedules'),
          description: t('upload.checkCsvFormat'),
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
          description: t('upload.successfullyUploaded', { count: result.data.length.toString() }),
        });
        onUploadComplete();
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('upload.uploadFailed'),
        description: t('upload.uploadFailedDescription'),
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
          {t('upload.bulkUploadDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileTextIcon className="w-4 h-4 mr-2" />
            {t('upload.downloadTemplate')}
          </Button>
        </div>

        <div>
          <Label htmlFor="csv-file">{t('upload.selectCsvFile')}</Label>
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
              <strong>{t('upload.selectedFile')}:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
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
              {t('upload.successfullyUploaded', { count: uploadResult.success.toString() })}
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? t('upload.uploading') : t('upload.uploadSchedules')}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>{t('upload.csvFormatRequirements')}</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('upload.csvHeaders')}</li>
            <li>{t('upload.dateFormat')}</li>
            <li>{t('upload.timeFormat')}</li>
            <li>{t('upload.durationFormat')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkScheduleUpload;
