import React, { useState, useEffect } from "react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { classScheduleService } from "@/services/classScheduleService";
import { Upload, Calendar, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, [teacher.id]);

  const fetchSchedules = async () => {
    try {
      const result = await classScheduleService.getSchedulesByTeacher(teacher.id);
      if (result.data) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch class schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCreated = () => {
    fetchSchedules(); // Refresh the schedule list
  };

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Schedule Form */}
      <ClassScheduleForm 
        teacher={teacher} 
        onScheduleCreated={handleScheduleCreated}
      />

      {/* Existing Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Class Schedules ({schedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No class schedules created yet. Create your first schedule above.
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
                          Grade {schedule.grade} | {schedule.school}
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

      {/* Bulk Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Upload multiple class schedules at once using a CSV file.
          </p>
          <Button variant="outline" disabled>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleTab;
