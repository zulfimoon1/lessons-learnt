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
  PlusIcon,
  CreditCardIcon,
  RefreshCwIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import { useNavigate } from "react-router-dom";

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
  } | null;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  amount: number;
  current_period_end: string;
  plan_type: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

const TeacherDashboard = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
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
      
      // Filter out feedback items where class_schedules is null
      const validFeedback = (feedbackData || []).filter(feedback => feedback.class_schedules !== null);
      setFeedbackData(validFeedback);

      // Load subscription for this school
      await loadSubscription();

    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      console.log('=== LOADING SUBSCRIPTION ===');
      console.log('Looking for subscription for school:', teacher?.school);
      
      setSubscriptionError(null);
      
      // Get all subscriptions to see what's available
      const { data: allSubs, error: allSubsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (allSubsError) {
        console.error('Error fetching all subscriptions:', allSubsError);
        setSubscriptionError(`Error fetching subscriptions: ${allSubsError.message}`);
        return;
      }

      console.log('All subscriptions in database:', allSubs);

      if (!allSubs || allSubs.length === 0) {
        console.log('No subscriptions found in database');
        setSubscriptionError('No subscriptions found in the database');
        setSubscription(null);
        return;
      }

      // Try exact match first
      let foundSub = allSubs.find(sub => sub.school_name === teacher?.school);
      
      if (!foundSub) {
        // Try case-insensitive match
        foundSub = allSubs.find(sub => 
          sub.school_name?.toLowerCase() === teacher?.school?.toLowerCase()
        );
      }

      if (!foundSub) {
        // Try partial match
        foundSub = allSubs.find(sub => 
          sub.school_name?.includes(teacher?.school || '') || 
          (teacher?.school || '').includes(sub.school_name || '')
        );
      }

      if (foundSub) {
        console.log('Found subscription:', foundSub);
        setSubscription(foundSub);
        setSubscriptionError(null);
      } else {
        console.log('No matching subscription found for school:', teacher?.school);
        console.log('Available school names:', allSubs.map(s => s.school_name));
        setSubscriptionError(`No subscription found for school "${teacher?.school}". Available schools: ${allSubs.map(s => s.school_name).join(', ')}`);
        setSubscription(null);
      }

    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscriptionError(`Error loading subscription: ${error.message}`);
      setSubscription(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to portal:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: `Failed to open subscription management: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const refreshData = () => {
    console.log('Refreshing teacher dashboard data...');
    setIsLoading(true);
    fetchData();
  };

  const createRecurringClasses = async (baseSchedule: any) => {
    const { 
      is_recurring, 
      recurrence_pattern, 
      recurrence_end_date, 
      number_of_occurrences,
      ...classData 
    } = baseSchedule;
    
    // If not recurring, just return the single class data
    if (!is_recurring) {
      return [classData];
    }
    
    const classes = [];
    const startDate = new Date(classData.class_date);
    let endDate = recurrence_end_date ? new Date(recurrence_end_date) : null;
    let occurrences = number_of_occurrences || 4;
    
    // Calculate days to add based on pattern
    let daysToAdd = 7; // default weekly
    switch (recurrence_pattern) {
      case 'daily': 
        daysToAdd = 1;
        break;
      case 'weekly': 
        daysToAdd = 7;
        break;
      case 'bi-weekly': 
        daysToAdd = 14;
        break;
      case 'monthly': 
        daysToAdd = 30;
        break;
    }
    
    // Create the base class
    classes.push({...classData});
    
    // Create recurring classes
    let currentDate = new Date(startDate);
    let count = 1;
    
    while (count < occurrences) {
      // Add days based on pattern
      currentDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      
      // Stop if we've reached the end date
      if (endDate && currentDate > endDate) {
        break;
      }
      
      // Format date to YYYY-MM-DD
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Create a new class with the updated date
      classes.push({
        ...classData,
        class_date: formattedDate
      });
      
      count++;
    }
    
    return classes;
  };

  const handleScheduleSubmit = async (scheduleData: any) => {
    try {
      const classesToCreate = await createRecurringClasses(scheduleData);
      
      // Insert all classes
      const { error } = await supabase
        .from('class_schedules')
        .insert(
          classesToCreate.map(classData => ({
            teacher_id: teacher?.id,
            ...classData
          }))
        );

      if (error) throw error;

      toast({
        title: classesToCreate.length > 1 ? 
          `${classesToCreate.length} Classes Scheduled! 📅` : 
          "Class Scheduled! 📅",
        description: classesToCreate.length > 1 ? 
          `Your recurring classes have been added to the schedule.` :
          "Your class has been added to the schedule.",
      });

      setShowScheduleForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error scheduling classes:', error);
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
                <p className="text-gray-600">Welcome, {teacher?.name}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button onClick={refreshData} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </Button>
              <LanguageSwitcher />
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
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Subscription Status */}
            <Card className="mb-8 bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  School Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                          {subscription.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          ${(subscription.amount / 100).toFixed(2)}/month ({subscription.plan_type})
                        </p>
                        <p className="text-xs text-gray-500">
                          School: {subscription.school_name}
                        </p>
                        {subscription.current_period_end && (
                          <p className="text-xs text-gray-500">
                            Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button onClick={handleManageSubscription} variant="outline">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600">No subscription found for this school</p>
                        <p className="text-xs text-gray-500">School: {teacher?.school}</p>
                        {subscriptionError && (
                          <p className="text-xs text-red-500 mt-1">{subscriptionError}</p>
                        )}
                      </div>
                      <Button 
                        onClick={() => navigate('/pricing')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Subscribe Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug Information - Only show if there's an error or no subscription */}
            {(!subscription || subscriptionError) && (
              <Card className="mb-8 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-sm text-yellow-800">Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p><strong>Current School:</strong> {teacher?.school}</p>
                  <p><strong>Subscription Found:</strong> {subscription ? 'Yes' : 'No'}</p>
                  {subscriptionError && (
                    <p><strong>Error:</strong> {subscriptionError}</p>
                  )}
                  <Button 
                    onClick={loadSubscription} 
                    size="sm" 
                    variant="outline"
                    className="mt-2"
                  >
                    Reload Subscription
                  </Button>
                </CardContent>
              </Card>
            )}

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
                <CardTitle>{t('dashboard.teacher.schedule')}</CardTitle>
                <CardDescription>
                  {t('dashboard.teacher.scheduleDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>{t('dashboard.teacher.noClasses')}</p>
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
                        <Badge variant="outline">{schedule.duration_minutes} {t('common.min')}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Table */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle>{t('dashboard.teacher.studentFeedback')}</CardTitle>
                <CardDescription>
                  {t('dashboard.teacher.feedbackDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>{t('dashboard.teacher.noFeedback')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('schedule.date')}</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>{t('dashboard.teacher.understanding')}</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>{t('dashboard.teacher.emotionalState')}</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbackData.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{formatDate(feedback.submitted_at)}</TableCell>
                          <TableCell className="font-medium">
                            {feedback.class_schedules?.subject || t('common.unknown')} - {feedback.class_schedules?.lesson_topic || t('common.unknown')}
                          </TableCell>
                          <TableCell>
                            {feedback.is_anonymous ? (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                {t('dashboard.teacher.anonymous')}
                              </Badge>
                            ) : (
                              feedback.student_name || t('common.unknown')
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
                              {t('dashboard.teacher.viewDetails')}
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
                      <CardTitle>{t('dashboard.teacher.detailedFeedback')}</CardTitle>
                      <CardDescription>
                        {selectedFeedback.class_schedules?.subject || t('common.unknown')} - {selectedFeedback.class_schedules?.lesson_topic || t('common.unknown')} ({formatDate(selectedFeedback.submitted_at)})
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      {t('dashboard.teacher.close')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.understanding')}</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.understanding)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.understanding}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.interestLevel')}</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.interest)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.interest}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.educationalGrowth')}</h4>
                      <div className="flex">
                        {renderStars(selectedFeedback.educational_growth)}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedFeedback.educational_growth}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.emotionalState')}</h4>
                    <Badge variant="outline" className="capitalize">
                      {selectedFeedback.emotional_state}
                    </Badge>
                  </div>

                  {selectedFeedback.what_went_well && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.whatWentWell')}</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        {selectedFeedback.what_went_well}
                      </p>
                    </div>
                  )}

                  {selectedFeedback.suggestions && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.suggestions')}</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        {selectedFeedback.suggestions}
                      </p>
                    </div>
                  )}

                  {selectedFeedback.additional_comments && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('dashboard.teacher.additionalComments')}</h4>
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
