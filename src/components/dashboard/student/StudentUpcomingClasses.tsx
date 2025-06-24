
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, BookOpen, User, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClassSchedule {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  teacher_id: string;
  school: string;
  grade: string;
  teachers: {
    name: string;
  };
}

interface StudentUpcomingClassesProps {
  student: {
    id: string;
    full_name: string;
    school: string;
    grade: string;
  };
}

const StudentUpcomingClasses: React.FC<StudentUpcomingClassesProps> = ({ student }) => {
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingClasses();
  }, [student.school, student.grade]);

  const fetchUpcomingClasses = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('class_schedules')
        .select(`
          *,
          teachers!inner(name)
        `)
        .eq('school', student.school)
        .eq('grade', student.grade)
        .gte('class_date', today)
        .order('class_date', { ascending: true })
        .order('class_time', { ascending: true })
        .limit(20);

      if (error) throw error;

      setUpcomingClasses(data || []);
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch upcoming classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveFeedback = (classScheduleId: string) => {
    // Navigate to feedback form
    navigate(`/student-dashboard?tab=feedback&classId=${classScheduleId}`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading upcoming classes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingClasses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming classes scheduled</p>
            <p className="text-sm text-muted-foreground mt-2">
              Classes for {student.grade} at {student.school} will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold">{classItem.subject}</h3>
                      <Badge variant="outline">{classItem.grade}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{classItem.lesson_topic}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(classItem.class_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {classItem.class_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {classItem.teachers.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {classItem.duration_minutes} minutes
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveFeedback(classItem.id)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Leave Feedback
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentUpcomingClasses;
