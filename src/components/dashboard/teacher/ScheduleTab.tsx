
import React, { useState, useEffect } from "react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import BulkScheduleUpload from "@/components/BulkScheduleUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classScheduleService } from "@/services/classScheduleService";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScheduleTabProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ teacher }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchSchedules();
  }, [teacher.id]);

  const fetchSchedules = async () => {
    try {
      console.log('ScheduleTab: Attempting to fetch schedules for teacher:', teacher.id);
      setFetchError("");
      
      const result = await classScheduleService.getSchedulesByTeacher(teacher.id);
      if (result.data) {
        console.log('ScheduleTab: Successfully fetched schedules:', result.data.length);
        setSchedules(result.data);
      } else if (result.error) {
        console.error('ScheduleTab: Error from service:', result.error);
        setFetchError('Unable to load existing schedules. You can still create new ones.');
        setSchedules([]); // Set empty array instead of failing
      }
    } catch (error) {
      console.error('ScheduleTab: Error fetching schedules:', error);
      setFetchError('Unable to load existing schedules. You can still create new ones.');
      setSchedules([]); // Set empty array instead of failing
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCreated = () => {
    console.log('ScheduleTab: Schedule created, refreshing list...');
    fetchSchedules(); // Refresh the schedule list
  };

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Single Schedule Form */}
      <ClassScheduleForm 
        teacher={teacher} 
        onScheduleCreated={handleScheduleCreated}
      />

      {/* Bulk Upload Section */}
      <BulkScheduleUpload 
        teacher={teacher} 
        onUploadComplete={handleScheduleCreated} 
      />

      {/* Existing Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('schedule.mySchedules')} ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">{fetchError}</p>
            </div>
          )}
          
          {schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {fetchError ? 'Create your first schedule below.' : t('schedule.noSchedules')}
            </p>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {schedule.subject} - {schedule.lesson_topic}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.grade')} {schedule.grade} | {schedule.school}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(schedule.class_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.class_time} ({schedule.duration_minutes} min)
                          </span>
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
