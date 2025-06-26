
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronDown, User, BookOpen, Calendar, ArrowLeft } from "lucide-react";

interface TeacherPerformance {
  teacher_id: string;
  teacher_name: string;
  overall_avg: number;
  total_responses: number;
  subjects: SubjectPerformance[];
}

interface SubjectPerformance {
  subject: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
  classes: ClassPerformance[];
}

interface ClassPerformance {
  class_date: string;
  lesson_topic: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
}

interface RawFeedbackData {
  understanding: number;
  interest: number;
  educational_growth: number;
  class_schedules: {
    teacher_id: string;
    lesson_topic: string;
    class_date: string;
    subject: string;
    school: string;
    teachers: {
      name: string;
    };
  };
}

interface HierarchicalFeedbackAnalyticsProps {
  school: string;
}

const HierarchicalFeedbackAnalytics: React.FC<HierarchicalFeedbackAnalyticsProps> = ({ school }) => {
  const [teacherData, setTeacherData] = useState<TeacherPerformance[]>([]);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHierarchicalData();
  }, [school]);

  const fetchHierarchicalData = async () => {
    try {
      setIsLoading(true);

      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(
            teacher_id,
            lesson_topic,
            class_date,
            subject,
            school,
            teachers!inner(name)
          )
        `)
        .eq('class_schedules.school', school);

      if (error) throw error;

      const processedData = processHierarchicalData(feedbackData || []);
      setTeacherData(processedData);

    } catch (error) {
      console.error('Error fetching hierarchical feedback data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processHierarchicalData = (rawData: RawFeedbackData[]): TeacherPerformance[] => {
    const teacherMap = new Map<string, {
      teacher_id: string;
      teacher_name: string;
      subjects: Map<string, {
        subject: string;
        classes: Map<string, {
          class_date: string;
          lesson_topic: string;
          total_understanding: number;
          total_interest: number;
          total_growth: number;
          total_responses: number;
        }>;
        total_understanding: number;
        total_interest: number;
        total_growth: number;
        total_responses: number;
      }>;
      total_understanding: number;
      total_interest: number;
      total_growth: number;
      total_responses: number;
    }>();

    rawData.forEach(item => {
      const teacherId = item.class_schedules.teacher_id;
      const teacherName = item.class_schedules.teachers.name;
      const subject = item.class_schedules.subject;
      const classKey = `${item.class_schedules.class_date}-${item.class_schedules.lesson_topic}`;

      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          teacher_id: teacherId,
          teacher_name: teacherName,
          subjects: new Map(),
          total_understanding: 0,
          total_interest: 0,
          total_growth: 0,
          total_responses: 0
        });
      }

      const teacher = teacherMap.get(teacherId)!;
      
      if (!teacher.subjects.has(subject)) {
        teacher.subjects.set(subject, {
          subject,
          classes: new Map(),
          total_understanding: 0,
          total_interest: 0,
          total_growth: 0,
          total_responses: 0
        });
      }

      const subjectData = teacher.subjects.get(subject)!;
      
      if (!subjectData.classes.has(classKey)) {
        subjectData.classes.set(classKey, {
          class_date: item.class_schedules.class_date,
          lesson_topic: item.class_schedules.lesson_topic,
          total_understanding: 0,
          total_interest: 0,
          total_growth: 0,
          total_responses: 0
        });
      }

      const classData = subjectData.classes.get(classKey)!;
      
      // Update class metrics
      classData.total_understanding += item.understanding;
      classData.total_interest += item.interest;
      classData.total_growth += item.educational_growth;
      classData.total_responses++;

      // Update subject metrics
      subjectData.total_understanding += item.understanding;
      subjectData.total_interest += item.interest;
      subjectData.total_growth += item.educational_growth;
      subjectData.total_responses++;

      // Update teacher metrics
      teacher.total_understanding += item.understanding;
      teacher.total_interest += item.interest;
      teacher.total_growth += item.educational_growth;
      teacher.total_responses++;
    });

    return Array.from(teacherMap.values()).map(teacher => ({
      teacher_id: teacher.teacher_id,
      teacher_name: teacher.teacher_name,
      overall_avg: teacher.total_responses > 0 
        ? (teacher.total_understanding + teacher.total_interest + teacher.total_growth) / (teacher.total_responses * 3)
        : 0,
      total_responses: teacher.total_responses,
      subjects: Array.from(teacher.subjects.values()).map(subject => ({
        subject: subject.subject,
        avg_understanding: subject.total_responses > 0 ? subject.total_understanding / subject.total_responses : 0,
        avg_interest: subject.total_responses > 0 ? subject.total_interest / subject.total_responses : 0,
        avg_growth: subject.total_responses > 0 ? subject.total_growth / subject.total_responses : 0,
        total_responses: subject.total_responses,
        classes: Array.from(subject.classes.values()).map(cls => ({
          class_date: cls.class_date,
          lesson_topic: cls.lesson_topic,
          avg_understanding: cls.total_responses > 0 ? cls.total_understanding / cls.total_responses : 0,
          avg_interest: cls.total_responses > 0 ? cls.total_interest / cls.total_responses : 0,
          avg_growth: cls.total_responses > 0 ? cls.total_growth / cls.total_responses : 0,
          total_responses: cls.total_responses
        }))
      }))
    })).sort((a, b) => b.overall_avg - a.overall_avg);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return "default";
    if (rating >= 3) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-4">
      {expandedTeacher && expandedSubject && (
        <Button
          variant="outline"
          onClick={() => setExpandedSubject(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subjects
        </Button>
      )}

      {expandedTeacher && !expandedSubject && (
        <Button
          variant="outline"
          onClick={() => setExpandedTeacher(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>
      )}

      {!expandedTeacher && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Teacher Performance Overview</h3>
          {teacherData.map((teacher) => (
            <Card key={teacher.teacher_id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between"
                  onClick={() => setExpandedTeacher(teacher.teacher_id)}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-brand-teal" />
                    <div>
                      <h4 className="font-medium">{teacher.teacher_name}</h4>
                      <p className="text-sm text-gray-500">{teacher.total_responses} total responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getRatingBadge(teacher.overall_avg)}>
                      {teacher.overall_avg.toFixed(1)}/5.0
                    </Badge>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {expandedTeacher && !expandedSubject && (
        <div className="space-y-3">
          {(() => {
            const teacher = teacherData.find(t => t.teacher_id === expandedTeacher);
            return teacher ? (
              <>
                <h3 className="text-lg font-semibold">Subjects for {teacher.teacher_name}</h3>
                {teacher.subjects.map((subject) => (
                  <Card key={subject.subject} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between"
                        onClick={() => setExpandedSubject(subject.subject)}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-brand-orange" />
                          <div>
                            <h4 className="font-medium">{subject.subject}</h4>
                            <p className="text-sm text-gray-500">{subject.total_responses} responses</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <div className={getRatingColor(subject.avg_understanding)}>
                              Understanding: {subject.avg_understanding.toFixed(1)}
                            </div>
                            <div className={getRatingColor(subject.avg_interest)}>
                              Interest: {subject.avg_interest.toFixed(1)}
                            </div>
                            <div className={getRatingColor(subject.avg_growth)}>
                              Growth: {subject.avg_growth.toFixed(1)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : null;
          })()}
        </div>
      )}

      {expandedTeacher && expandedSubject && (
        <div className="space-y-3">
          {(() => {
            const teacher = teacherData.find(t => t.teacher_id === expandedTeacher);
            const subject = teacher?.subjects.find(s => s.subject === expandedSubject);
            return subject ? (
              <>
                <h3 className="text-lg font-semibold">Classes for {expandedSubject}</h3>
                {subject.classes.map((cls, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-brand-teal" />
                          <div>
                            <h4 className="font-medium">{cls.lesson_topic}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(cls.class_date).toLocaleDateString()} • {cls.total_responses} responses
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-right">
                          <div>
                            <div className={getRatingColor(cls.avg_understanding)}>
                              {cls.avg_understanding.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Understanding</div>
                          </div>
                          <div>
                            <div className={getRatingColor(cls.avg_interest)}>
                              {cls.avg_interest.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Interest</div>
                          </div>
                          <div>
                            <div className={getRatingColor(cls.avg_growth)}>
                              {cls.avg_growth.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Growth</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : null;
          })()}
        </div>
      )}

      {teacherData.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No feedback data available yet. Data will appear here as students submit feedback.
        </p>
      )}
    </div>
  );
};

export default HierarchicalFeedbackAnalytics;
