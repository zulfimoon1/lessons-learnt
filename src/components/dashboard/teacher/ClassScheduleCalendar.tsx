
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Users, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { classScheduleService } from '@/services/classScheduleService';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay } from 'date-fns';

interface ClassSchedule {
  id: string;
  teacher_id: string;
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
}

interface SchoolEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  description?: string;
  color: string;
}

interface ClassScheduleCalendarProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const ClassScheduleCalendar: React.FC<ClassScheduleCalendarProps> = ({ teacher }) => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        console.log('ClassScheduleCalendar: Teacher data:', teacher);
        console.log('ClassScheduleCalendar: Fetching data for school:', teacher.school);
        
        // Fetch class schedules
        const response = await classScheduleService.getSchedulesByTeacher(teacher.id);
        if (response.data) {
          setSchedules(response.data);
          console.log('ClassScheduleCalendar: Fetched schedules:', response.data.length);
        }

        // Set platform admin context for school calendar events access
        const adminEmail = localStorage.getItem('platform_admin');
        const teacherData = localStorage.getItem('teacher');
        
        console.log('ClassScheduleCalendar: Admin email from storage:', adminEmail);
        console.log('ClassScheduleCalendar: Teacher data from storage:', teacherData);
        
        if (adminEmail) {
          const adminData = JSON.parse(adminEmail);
          console.log('ClassScheduleCalendar: Setting admin context with:', adminData.email);
          await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
        } else if (teacherData) {
          // Set teacher email context for RLS policy access
          const teacherInfo = JSON.parse(teacherData);
          console.log('ClassScheduleCalendar: Setting teacher context with:', teacherInfo.email);
          await supabase.rpc('set_platform_admin_context', { admin_email: teacherInfo.email });
        }

        // Fetch school calendar events
        const { data: events, error } = await supabase
          .from('school_calendar_events')
          .select('*')
          .eq('school', teacher.school)
          .order('start_date', { ascending: true });

        if (error) {
          console.error('ClassScheduleCalendar: Error fetching school events:', error);
        } else {
          console.log('ClassScheduleCalendar: Fetched school events:', events);
          setSchoolEvents(events || []);
        }
      } catch (error) {
        console.error('ClassScheduleCalendar: Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for school calendar events
    const channel = supabase
      .channel('school-calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_calendar_events',
          filter: `school=eq.${teacher.school}`
        },
        (payload) => {
          console.log('School calendar event changed:', payload);
          // Refetch school events when changes occur
          supabase
            .from('school_calendar_events')
            .select('*')
            .eq('school', teacher.school)
            .order('start_date', { ascending: true })
            .then(({ data, error }) => {
              if (!error && data) {
                setSchoolEvents(data);
              }
            });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacher.id, teacher.school]);

  // Get classes for selected date
  const getClassesForDate = (date: Date) => {
    return schedules.filter(schedule => 
      isSameDay(parseISO(schedule.class_date), date)
    );
  };

  // Get school events for selected date
  const getSchoolEventsForDate = (date: Date) => {
    return schoolEvents.filter(event => 
      isSameDay(parseISO(event.start_date), date) ||
      (event.end_date && date >= parseISO(event.start_date) && date <= parseISO(event.end_date))
    );
  };

  // Get all dates that have classes or events
  const getDatesWithActivity = () => {
    const classDates = schedules.map(schedule => parseISO(schedule.class_date));
    const eventDates = schoolEvents.map(event => parseISO(event.start_date));
    return [...classDates, ...eventDates];
  };

  // Get event dates specifically for styling
  const getSchoolEventDates = () => {
    return schoolEvents.map(event => parseISO(event.start_date));
  };

  const selectedDateClasses = getClassesForDate(selectedDate);
  const selectedDateEvents = getSchoolEventsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3">Loading your schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Class Schedule</h3>
          <p className="text-sm text-gray-600">
            {schedules.length} classes scheduled
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Scheduled</h3>
            <p className="text-gray-600">
              Create your first class schedule using the forms above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar View</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      modifiers={{
                        hasClasses: getDatesWithActivity(),
                        hasEvents: getSchoolEventDates()
                      }}
                      modifiersStyles={{
                        hasClasses: {
                          backgroundColor: '#0f766e',
                          color: 'white',
                          fontWeight: 'bold'
                        }
                      }}
                      className="rounded-md border pointer-events-auto"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Selected Date Classes */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* School Events */}
                    {selectedDateEvents.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          School Events
                        </h5>
                        {selectedDateEvents.map((event) => (
                          <div key={event.id} className="p-3 rounded-lg space-y-1"
                               style={{ backgroundColor: `${event.color}15`, borderLeft: `3px solid ${event.color}` }}>
                            <h6 className="font-medium text-sm">{event.title}</h6>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {event.description && (
                              <p className="text-xs text-gray-600">{event.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Classes */}
                    {selectedDateClasses.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Your Classes
                        </h5>
                        {selectedDateClasses
                          .sort((a, b) => a.class_time.localeCompare(b.class_time))
                          .map((classItem) => (
                            <div key={classItem.id} className="p-3 border rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{classItem.subject}</Badge>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {classItem.class_time}
                                </div>
                              </div>
                              <h4 className="font-medium text-sm">{classItem.lesson_topic}</h4>
                              <div className="flex items-center text-xs text-gray-600">
                                <Users className="w-3 h-3 mr-1" />
                                Grade {classItem.grade}
                              </div>
                              {classItem.description && (
                                <p className="text-xs text-gray-600">{classItem.description}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {selectedDateClasses.length === 0 && selectedDateEvents.length === 0 && (
                      <p className="text-gray-500 text-sm">No classes or events scheduled for this date.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>All Scheduled Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedules
                      .sort((a, b) => {
                        const dateCompare = new Date(a.class_date).getTime() - new Date(b.class_date).getTime();
                        if (dateCompare === 0) {
                          return a.class_time.localeCompare(b.class_time);
                        }
                        return dateCompare;
                      })
                      .map((classItem) => (
                        <div key={classItem.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{classItem.lesson_topic}</h4>
                              <p className="text-sm text-gray-600">{classItem.subject} • Grade {classItem.grade}</p>
                            </div>
                            <Badge variant="outline">{classItem.subject}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {format(parseISO(classItem.class_date), 'MMM d, yyyy')} at {classItem.class_time}
                            </div>
                            <span>({classItem.duration_minutes} min)</span>
                          </div>
                          {classItem.description && (
                            <p className="text-sm text-gray-600 mt-2">{classItem.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassScheduleCalendar;
