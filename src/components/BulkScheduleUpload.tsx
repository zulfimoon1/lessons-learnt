
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadIcon, FileTextIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BulkScheduleUploadProps {
  teacher: {
    id: string;
    school: string;
  };
  onUploadComplete: () => void;
}

const BulkScheduleUpload = ({ teacher, onUploadComplete }: BulkScheduleUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: t('common.error'),
        description: t('upload.csvOnly'),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected headers: subject, grade, lesson_topic, class_date, class_time, duration_minutes, description
      const requiredHeaders = ['subject', 'grade', 'lesson_topic', 'class_date', 'class_time'];
      const hasRequiredHeaders = requiredHeaders.every(header => headers.includes(header));
      
      if (!hasRequiredHeaders) {
        toast({
          title: t('common.error'),
          description: t('upload.invalidHeaders'),
          variant: "destructive",
        });
        return;
      }

      const schedules = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length !== headers.length) continue;

        const schedule: any = {
          teacher_id: teacher.id,
          school: teacher.school,
        };

        headers.forEach((header, index) => {
          schedule[header] = values[index];
        });

        // Set default duration if not provided
        if (!schedule.duration_minutes) {
          schedule.duration_minutes = 60;
        } else {
          schedule.duration_minutes = parseInt(schedule.duration_minutes) || 60;
        }

        schedules.push(schedule);
      }

      if (schedules.length === 0) {
        toast({
          title: t('common.error'),
          description: t('upload.noValidData'),
          variant: "destructive",
        });
        return;
      }

      // Insert schedules in batches
      const { error } = await supabase
        .from('class_schedules')
        .insert(schedules);

      if (error) throw error;

      toast({
        title: t('upload.success'),
        description: t('upload.schedulesUploaded', { count: schedules.length.toString() }),
      });

      onUploadComplete();
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('common.error'),
        description: t('upload.failed'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="w-5 h-5" />
          {t('upload.bulkSchedule')}
        </CardTitle>
        <CardDescription>
          {t('upload.csvDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-upload">{t('upload.selectFile')}</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" />
            {t('upload.csvFormat')}
          </h4>
          <p className="text-sm text-blue-700 mb-2">{t('upload.requiredColumns')}:</p>
          <code className="text-xs bg-white p-2 rounded block">
            subject,grade,lesson_topic,class_date,class_time,duration_minutes,description
          </code>
          <p className="text-xs text-blue-600 mt-2">{t('upload.formatNote')}</p>
        </div>
        
        {isUploading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">{t('upload.processing')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkScheduleUpload;
