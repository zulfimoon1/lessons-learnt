
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCapIcon, 
  LogOutIcon, 
  StarIcon, 
  MessageCircleIcon,
  BellIcon,
  TrendingUpIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarPlusIcon,
  PlusIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ClassScheduleForm from "@/components/ClassScheduleForm";

interface ClassSchedule {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  school: string;
  grade: string;
  description?: string;
}

interface FeedbackData {
  id: string;
  class_schedule_id: string;
  student_name: string | null;
  is_anonymous: boolean;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string | null;
  suggestions: string | null;
  additional_comments: string | null;
  submitted_at: string;
  class_schedules: {
    subject: string;
    lesson_topic: string;
    class_date: string;
  };
}

const TeacherDashboard = () => {
  const { teacher, logout } = useAuth();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (teacher) {
      fetchData();
    }
  }, [teacher]);

  const fetchData = async () => {
    try {
      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('teacher_id', teacher?.id)
        .order('class_date', { ascending: true });

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);

      // Fetch feedback with class schedule details
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules (
            subject,
            lesson_topic,
            class_date,
            teacher_id
          )
        `)
        .eq('class_schedules.teacher_id', teacher?.id)
        .order('submitted_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedbackData(feedbackData || []);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (scheduleData: any) => {
    try {
      const { error } = await supabase
        .from('class_schedules')
        .insert({
          teacher_id: teacher?.id,
          ...scheduleData
        });

      if (error) throw error;

      toast({
        title: "Class scheduled! 📅",
        description: "Your class has been added to the schedule.",
      });

      setShowScheduleForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: "Failed to add class schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate dashboard stats
  const totalFeedback = feedbackData.length;
  const averageUnderstanding = feedbackData.reduce((acc, fb) => acc + fb.understanding, 0) / totalFeedback || 0;
  const averageInterest = feedbackData.reduce((acc, fb) => acc + fb.interest, 0) / totalFeedback || 0;
  const recentFeedback = feedbackData.filter(fb => {
    const feedbackDate = new Date(fb.submitted_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - feedbackDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showScheduleForm) {
    return (
      <ClassScheduleForm
        onSubmit={handleScheduleSubmit}
        onCancel={() => setShowScheduleForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back, {teacher?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowScheduleForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Class
              </Button>
              <Button 
                onClick={logout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <CalendarPlusIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{schedules.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                  <MessageCircleIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalFeedback}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Understanding</CardTitle>
                  <BookOpenIcon className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageUnderstanding.toFixed(1)}/5</div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <BellIcon className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentFeedback}</div>
                </CardContent>
              </Card>
            </div>

            {/* Class Schedules */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200 mb-8">
              <CardHeader>
                <CardTitle>Your Class Schedule</CardTitle>
                <CardDescription>
                  Manage your upcoming classes and view student enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No classes scheduled yet. Add your first class!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{schedule.subject} - {schedule.lesson_topic}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(schedule.class_date)} • {schedule.class_time} • {schedule.school}, {schedule.grade}
                          </p>
                        </div>
                        <Badge variant="outline">{schedule.duration_minutes} min</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Table */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle>Student Feedback</CardTitle>
                <CardDescription>
                  Review and analyze feedback from your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No feedback submissions yet. Students will see your scheduled classes and can submit feedback.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Understanding</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Emotional State</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbackData.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{formatDate(feedback.submitted_at)}</TableCell>
                          <TableCell className="font-medium">
                            {feedback.class_schedules.subject} - {feedback.class_schedules.lesson_topic}
                          </TableCell>
                          <TableCell>
                            {feedback.is_anonymous ? (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                Anonymous
                              </Badge>
                            ) : (
                              feedback.student_name || "Unknown"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {renderStars(feedback.understanding)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {renderStars(feedback.interest)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {feedback.emotional_state}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Detailed Feedback Modal/Card */}
            {selectedFeedback && (
              <Card className="mt-6 bg-white/70 backdrop-blur-sm border-gray-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Detailed Feedback</CardTitle>
                      <CardDescription>
                        {selectedFeedback.class_schedules.subject} - {selectedFeedback.class_schedules.lesson_topic} ({formatDate(selectedFeedback.submitted_at)})
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Understanding</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.understanding)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.understanding}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Interest Level</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.interest)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.interest}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Educational Growth</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.educational_growth)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.educational_growth}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Emotional State</h4>
                    <Badge variant="outline" className="capitalize">
                      {selectedFeedback.emotional_state}
                    </Badge>
                  </div>

                  {selectedFeedback.what_went_well && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">What Went Well</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        {selectedFeedback.what_went_well}
                      </p>
                    </div>
                  )}

                  {selectedFeedback.suggestions && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Suggestions for Improvement</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        {selectedFeedback.suggestions}
                      </p>
                    </div>
                  )}

                  {selectedFeedback.additional_comments && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Additional Comments</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        {selectedFeedback.additional_comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
