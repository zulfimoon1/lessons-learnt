
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, BookOpen, BarChart3, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface FeedbackData {
  id: string;
  class_schedule_id: string;
  student_name: string;
  emotional_state: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  submitted_at: string;
  is_anonymous: boolean;
  class_schedules: {
    lesson_topic: string;
    subject: string;
    class_date: string;
    class_time: string;
    teacher_id: string;
  };
  teachers: {
    name: string;
    email: string;
  };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface FeedbackByTeacherViewProps {
  school: string;
}

const FeedbackByTeacherView: React.FC<FeedbackByTeacherViewProps> = ({ school }) => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachersAndFeedback();
  }, [school]);

  const fetchTeachersAndFeedback = async () => {
    try {
      setLoading(true);
      
      // Fetch teachers from this school
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('id, name, email')
        .eq('school', school)
        .order('name');

      if (teachersData) {
        setTeachers(teachersData);
      }

      // Fetch feedback with class schedules and teacher info
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner (
            lesson_topic,
            subject,
            class_date,
            class_time,
            teacher_id,
            school
          )
        `)
        .eq('class_schedules.school', school)
        .order('submitted_at', { ascending: false });

      if (feedbackData) {
        // Enrich feedback with teacher information
        const enrichedFeedback = await Promise.all(
          feedbackData.map(async (item) => {
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('name, email')
              .eq('id', item.class_schedules.teacher_id)
              .single();

            return {
              ...item,
              teachers: teacherData || { name: 'Unknown Teacher', email: '' }
            };
          })
        );

        setFeedback(enrichedFeedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = selectedTeacher === 'all' 
    ? feedback 
    : feedback.filter(item => item.class_schedules.teacher_id === selectedTeacher);

  const getEmotionalStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'very positive': return 'bg-green-100 text-green-800';
      case 'positive': return 'bg-green-50 text-green-700';
      case 'neutral': return 'bg-gray-100 text-gray-700';
      case 'negative': return 'bg-red-50 text-red-700';
      case 'very negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAverageRating = (understanding: number, interest: number, growth: number) => {
    return ((understanding + interest + growth) / 3).toFixed(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Feedback by Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Feedback by Teacher
          </CardTitle>
          <CardDescription>
            View and analyze student feedback for each teacher's lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchTeachersAndFeedback} variant="outline">
              Refresh Data
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredFeedback.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Feedback Available</h3>
                <p className="text-gray-500">
                  {selectedTeacher === 'all' 
                    ? 'No feedback has been submitted yet.' 
                    : 'No feedback has been submitted for this teacher yet.'}
                </p>
              </Card>
            ) : (
              filteredFeedback.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {item.class_schedules.lesson_topic}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.teachers.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.class_schedules.class_date), 'MMM dd, yyyy')} at {item.class_schedules.class_time}
                          </span>
                          <Badge variant="outline">{item.class_schedules.subject}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getEmotionalStateColor(item.emotional_state)}>
                          {item.emotional_state}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          Avg: {getAverageRating(item.understanding, item.interest, item.educational_growth)}/5
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-brand-teal">{item.understanding}</div>
                        <div className="text-xs text-gray-500">Understanding</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-brand-orange">{item.interest}</div>
                        <div className="text-xs text-gray-500">Interest</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{item.educational_growth}</div>
                        <div className="text-xs text-gray-500">Growth</div>
                      </div>
                    </div>

                    {(item.what_went_well || item.suggestions || item.additional_comments) && (
                      <div className="space-y-3 border-t pt-4">
                        {item.what_went_well && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-1">What went well:</h4>
                            <p className="text-sm text-gray-700">{item.what_went_well}</p>
                          </div>
                        )}
                        {item.suggestions && (
                          <div>
                            <h4 className="font-medium text-blue-700 mb-1">Suggestions:</h4>
                            <p className="text-sm text-gray-700">{item.suggestions}</p>
                          </div>
                        )}
                        {item.additional_comments && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Additional comments:</h4>
                            <p className="text-sm text-gray-700">{item.additional_comments}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-500">
                      <span>
                        By: {item.is_anonymous ? 'Anonymous Student' : item.student_name || 'Anonymous'}
                      </span>
                      <span>
                        {format(new Date(item.submitted_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackByTeacherView;
