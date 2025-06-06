import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCapIcon, UsersIcon, MessageSquareIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Teacher, TeacherFeedbackSummary } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const AdminDashboard = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbackSummaries, setFeedbackSummaries] = useState<TeacherFeedbackSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teacher && teacher.role === 'admin') {
      loadDashboardData();
    }
  }, [teacher]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load teachers from the same school
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher?.school);

      if (teachersError) throw teachersError;
      
      const teachersList: Teacher[] = (teachersData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        school: t.school || 'Default School',
        role: (t.role as 'teacher' | 'admin') || 'teacher'
      }));
      
      setTeachers(teachersList);

      // Fetch feedback summaries grouped by teacher and class
      const { data: summaryData, error: summaryError } = await supabase
        .from('feedback')
        .select(`
          class_schedule_id,
          understanding,
          interest,
          educational_growth,
          class_schedules(
            teacher_id,
            subject,
            class_date,
            lesson_topic,
            teachers(name)
          )
        `)
        .eq('class_schedules.teachers.school', teacher?.school);

      if (summaryError) throw summaryError;

      // Process and aggregate feedback data
      const summaryMap = new Map<string, TeacherFeedbackSummary>();
      
      summaryData?.forEach((feedback: any) => {
        if (!feedback.class_schedules) return;
        
        const classSchedule = feedback.class_schedules;
        const key = `${classSchedule.teacher_id}-${classSchedule.subject}-${classSchedule.class_date}`;
        
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            teacher_id: classSchedule.teacher_id,
            teacher_name: classSchedule.teachers?.name || 'Unknown',
            subject: classSchedule.subject,
            class_date: classSchedule.class_date,
            lesson_topic: classSchedule.lesson_topic || '',
            avg_understanding: feedback.understanding,
            avg_interest: feedback.interest,
            avg_educational_growth: feedback.educational_growth,
            total_feedback: 1
          });
        } else {
          const existing = summaryMap.get(key)!;
          existing.avg_understanding += feedback.understanding;
          existing.avg_interest += feedback.interest;
          existing.avg_educational_growth += feedback.educational_growth;
          existing.total_feedback++;
        }
      });

      // Calculate averages
      const summaries = Array.from(summaryMap.values()).map(summary => ({
        ...summary,
        avg_understanding: Math.round((summary.avg_understanding / summary.total_feedback) * 10) / 10,
        avg_interest: Math.round((summary.avg_interest / summary.total_feedback) * 10) / 10,
        avg_educational_growth: Math.round((summary.avg_educational_growth / summary.total_feedback) * 10) / 10
      }));

      setFeedbackSummaries(summaries);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: t('admin.error.title') || "Error loading data",
        description: t('admin.error.description') || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToPricing = () => {
    navigate('/pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>{t('admin.loading') || "Loading dashboard..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('admin.title') || "Admin Dashboard"}</h1>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {teacher?.school}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{t('admin.welcome') || "Welcome"}, {teacher?.name}</span>
            <LanguageSwitcher />
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              {t('admin.logout') || "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.teachers') || "Total Teachers"}</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.feedback') || "Total Feedback"}</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackSummaries.reduce((acc, curr) => acc + curr.total_feedback, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscription') || "Subscription"}</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoToPricing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t('admin.subscribe') || "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.teachers.title') || "Teachers"} at {teacher?.school}</CardTitle>
              <CardDescription>{t('admin.teachers.description') || "Manage teachers at your school"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachers.map((teacherItem) => (
                  <div key={teacherItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacherItem.name}</p>
                      <p className="text-sm text-gray-500">{teacherItem.email}</p>
                    </div>
                    <Badge variant={teacherItem.role === 'admin' ? 'default' : 'secondary'}>
                      {teacherItem.role}
                    </Badge>
                  </div>
                ))}
                {teachers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">{t('admin.teachers.empty') || "No teachers found"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>{t('admin.feedback.title') || "Feedback Summary"}</CardTitle>
              <CardDescription>{t('admin.feedback.description') || "Overview of student feedback per teacher and class"}</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackSummaries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.feedback.teacher') || "Teacher"}</TableHead>
                      <TableHead>{t('admin.feedback.subject') || "Subject"}</TableHead>
                      <TableHead>{t('admin.feedback.date') || "Date"}</TableHead>
                      <TableHead className="text-right">{t('admin.feedback.scores') || "Scores"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackSummaries.map((summary, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{summary.teacher_name}</TableCell>
                        <TableCell>
                          <div>
                            <div>{summary.subject}</div>
                            <div className="text-xs text-gray-500">{summary.lesson_topic}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(summary.class_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-1 items-end">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {t('admin.feedback.understanding') || "Understanding"}: {summary.avg_understanding.toFixed(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {t('admin.feedback.interest') || "Interest"}: {summary.avg_interest.toFixed(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {t('admin.feedback.growth') || "Growth"}: {summary.avg_educational_growth.toFixed(1)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {summary.total_feedback} {t('admin.feedback.responses') || "responses"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {t('admin.feedback.empty') || "No feedback data available yet"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
