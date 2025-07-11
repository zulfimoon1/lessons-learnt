
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, MessageSquare, TrendingUp, BarChart3, Percent, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface FeedbackAnalytics {
  teacher_name: string;
  lesson_topic: string;
  class_date: string;
  subject: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  description?: string;
  color: string;
}

interface SchoolAdminDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
    email: string;
  };
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ teacher }) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackAnalytics[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [schoolStats, setSchoolStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalFeedback: 0,
    activeClasses: 0,
    responseRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchoolData();
  }, [teacher.school]);

  const fetchSchoolData = async () => {
    try {
      setIsLoading(true);
      console.log('SchoolAdminDashboard: Fetching data for school:', teacher.school);

      // Set authentication context for calendar events
      if (teacher.email) {
        await supabase.rpc('set_platform_admin_context', { 
          admin_email: teacher.email 
        });
      }

      // Fetch all statistics in parallel
      const [
        { data: teachers, error: teachersError },
        { data: students, error: studentsError },
        { data: classes, error: classesError },
        { data: feedback, error: feedbackError },
        { data: events, error: eventsError }
      ] = await Promise.all([
        supabase.from('teachers').select('id').eq('school', teacher.school),
        supabase.from('students').select('id').eq('school', teacher.school),
        supabase.from('class_schedules').select('id, class_date').eq('school', teacher.school),
        supabase
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
          .eq('class_schedules.school', teacher.school),
        supabase
          .from('school_calendar_events')
          .select('*')
          .eq('school', teacher.school)
          .order('start_date', { ascending: true })
      ]);

      // Handle errors
      if (teachersError) {
        console.error('Teachers fetch error:', teachersError);
        throw teachersError;
      }
      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }
      if (classesError) {
        console.error('Classes fetch error:', classesError);
        throw classesError;
      }
      if (feedbackError) {
        console.error('Feedback fetch error:', feedbackError);
        throw feedbackError;
      }
      if (eventsError) {
        console.error('Calendar events fetch error:', eventsError);
        console.error('Events error details:', eventsError.message, eventsError.details);
        // Don't throw for events error, just log it
      }

      console.log('Raw data received:', {
        teachers: teachers?.length || 0,
        students: students?.length || 0,
        classes: classes?.length || 0,
        feedback: feedback?.length || 0,
        events: events?.length || 0
      });

      // Set calendar events
      console.log('Calendar events fetched:', events);
      setCalendarEvents(events || []);

      // Calculate active classes (classes scheduled for today or in the future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeClassesCount = classes?.filter(cls => {
        const classDate = new Date(cls.class_date);
        classDate.setHours(0, 0, 0, 0);
        return classDate >= today;
      }).length || 0;

      // Calculate response rate
      const totalPossibleResponses = classes?.length || 0;
      const actualResponses = feedback?.length || 0;
      const responseRate = totalPossibleResponses > 0 
        ? Math.round((actualResponses / totalPossibleResponses) * 100) 
        : 0;

      // Process feedback data
      const processedFeedback = processFeedbackData(feedback || []);
      setFeedbackData(processedFeedback);

      // Update stats
      const newStats = {
        totalTeachers: teachers?.length || 0,
        totalStudents: students?.length || 0,
        totalClasses: classes?.length || 0,
        totalFeedback: feedback?.length || 0,
        activeClasses: activeClassesCount,
        responseRate: responseRate
      };

      console.log('Setting school stats:', newStats);
      setSchoolStats(newStats);

    } catch (error) {
      console.error('SchoolAdminDashboard: Error fetching school data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processFeedbackData = (rawData: any[]): FeedbackAnalytics[] => {
    console.log('SchoolAdminDashboard: Processing feedback data:', rawData.length, 'items');
    
    const groupedData = rawData.reduce((acc, item) => {
      const key = `${item.class_schedules.teacher_id}-${item.class_schedules.lesson_topic}-${item.class_schedules.class_date}`;
      
      if (!acc[key]) {
        acc[key] = {
          teacher_name: item.class_schedules.teachers.name,
          lesson_topic: item.class_schedules.lesson_topic,
          class_date: item.class_schedules.class_date,
          subject: item.class_schedules.subject,
          understanding_scores: [],
          interest_scores: [],
          growth_scores: [],
          total_responses: 0
        };
      }
      
      acc[key].understanding_scores.push(item.understanding);
      acc[key].interest_scores.push(item.interest);
      acc[key].growth_scores.push(item.educational_growth);
      acc[key].total_responses++;
      
      return acc;
    }, {});

    const result = Object.values(groupedData).map((group: any) => ({
      teacher_name: group.teacher_name,
      lesson_topic: group.lesson_topic,
      class_date: group.class_date,
      subject: group.subject,
      avg_understanding: group.understanding_scores.reduce((a: number, b: number) => a + b, 0) / group.understanding_scores.length,
      avg_interest: group.interest_scores.reduce((a: number, b: number) => a + b, 0) / group.interest_scores.length,
      avg_growth: group.growth_scores.reduce((a: number, b: number) => a + b, 0) / group.growth_scores.length,
      total_responses: group.total_responses
    }));

    console.log('SchoolAdminDashboard: Processed feedback result:', result.length, 'grouped items');
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mr-3"></div>
        Loading school analytics...
      </div>
    );
  }

  console.log('SchoolAdminDashboard: Rendering with stats:', schoolStats);

  return (
    <div className="space-y-6">
      {/* School Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              All scheduled classes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.activeClasses}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">{schoolStats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average feedback rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Events Section */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Calendar Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calendarEvents.length > 0 ? (
            <div className="space-y-3">
              {calendarEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.start_date), 'MMM d, yyyy')}
                          {event.end_date && event.end_date !== event.start_date && 
                            ` - ${format(new Date(event.end_date), 'MMM d, yyyy')}`
                          }
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {calendarEvents.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{calendarEvents.length - 5} more events. View all in Settings → Calendar Management
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No calendar events found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create calendar events in Settings → Calendar Management to see them here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/90 backdrop-blur-sm border border-gray-200/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Teacher Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feedbackData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teacher_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_understanding" fill="#8884d8" name="Understanding" />
                    <Bar dataKey="avg_interest" fill="#82ca9d" name="Interest" />
                    <Bar dataKey="avg_growth" fill="#ffc658" name="Growth" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No feedback data available yet.</p>
                  <p className="text-xs text-muted-foreground mt-2">Charts will appear here as students submit feedback.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardHeader>
              <CardTitle>Feedback per Teacher per Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{item.teacher_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.subject} - {item.lesson_topic}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.class_date).toLocaleDateString()} | {item.total_responses} responses
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="font-medium">{item.avg_understanding.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Understanding</div>
                          </div>
                          <div>
                            <div className="font-medium">{item.avg_interest.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Interest</div>
                          </div>
                          <div>
                            <div className="font-medium">{item.avg_growth.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Growth</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {feedbackData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No feedback data available yet. Feedback will appear here as students submit responses.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolAdminDashboard;
