import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  description?: string;
  color: string;
}

interface SchoolCalendarManagerProps {
  teacher: {
    id: string;
    school: string;
    role: string;
    email: string;
  };
}

const SchoolCalendarManager: React.FC<SchoolCalendarManagerProps> = ({ teacher }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    event_type: '',
    start_date: '',
    end_date: '',
    description: '',
    color: '#dc2626'
  });

  useEffect(() => {
    loadCalendarEvents();
  }, [teacher.school]);

  const loadCalendarEvents = async () => {
    try {
      setIsLoading(true);
      
      console.log('Loading events for teacher:', teacher);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        console.log('Setting admin context for loading events:', adminData.email);
        const { error: contextError } = await supabase.rpc('set_platform_admin_context', { 
          admin_email: adminData.email 
        });
        
        if (contextError) {
          console.error('Context setting error during load:', contextError);
        }
      } else {
        console.error('No platform admin context found in localStorage');
      }
      
      const { data, error } = await supabase
        .from('school_calendar_events')
        .select('*')
        .eq('school', teacher.school)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      console.log('Loaded events:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      console.log('Teacher object:', teacher);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (!adminEmail) {
        console.error('No platform admin context found in localStorage');
        toast({
          title: "Error",
          description: "Authentication error: Admin context not found",
          variant: "destructive",
        });
        return;
      }

      const adminData = JSON.parse(adminEmail);
      console.log('Setting admin context for:', adminData.email);

      // Validate required fields
      if (!formData.title?.trim() || !formData.start_date) {
        toast({
          title: "Error",
          description: "Please enter a title and select a start date",
          variant: "destructive",
        });
        return;
      }

      const eventData = {
        title: formData.title.trim(),
        event_type: formData.event_type || 'School Event',
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        description: formData.description?.trim() || null,
        color: formData.color || '#dc2626',
        school: teacher.school,
        created_by: teacher.id
      };

      // Set context first (this now uses session-scoped settings)
      const { error: contextError } = await supabase.rpc('set_platform_admin_context', { 
        admin_email: adminData.email 
      });
      
      if (contextError) {
        console.error('Context setting error:', contextError);
        toast({
          title: "Error",
          description: "Authentication context error",
          variant: "destructive",
        });
        return;
      }

      // Then perform the database operation
      if (editingEvent) {
        const { error: updateError } = await supabase
          .from('school_calendar_events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (updateError) throw updateError;
        
        toast({
          title: "Success",
          description: "Calendar event updated successfully",
        });
      } else {
        const { error: insertError } = await supabase
          .from('school_calendar_events')
          .insert([eventData]);
        
        if (insertError) throw insertError;
        
        toast({
          title: "Success",
          description: "Calendar event created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        event_type: '',
        start_date: '',
        end_date: '',
        description: '',
        color: '#dc2626'
      });
      loadCalendarEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save calendar event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        await supabase.rpc('set_platform_admin_context', { 
          admin_email: adminData.email 
        });
      }
      
      const { error } = await supabase
        .from('school_calendar_events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Calendar event deleted successfully",
      });
      loadCalendarEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete calendar event",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date || '',
      description: event.description || '',
      color: event.color
    });
    setIsDialogOpen(true);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'term_start':
        return 'bg-green-100 text-green-800';
      case 'term_end':
        return 'bg-red-100 text-red-800';
      case 'holiday':
      case 'red_day':
        return 'bg-red-100 text-red-800';
      case 'school_event':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'term_start':
        return 'Term Start';
      case 'term_end':
        return 'Term End';
      case 'holiday':
        return 'Holiday';
      case 'red_day':
        return 'Red Day';
      case 'school_event':
        return 'School Event';
      default:
        return eventType;
    }
  };

  const termEvents = events.filter(e => e.event_type === 'term_start' || e.event_type === 'term_end');
  const holidayEvents = events.filter(e => e.event_type === 'holiday' || e.event_type === 'red_day');

  if (isLoading) {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Academic Calendar</CardTitle>
          <CardDescription>Loading calendar events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900">Academic Calendar</CardTitle>
            <CardDescription>Manage term dates, holidays, and important school dates</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-teal hover:bg-brand-teal/90"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({
                    title: '',
                    event_type: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                    color: '#dc2626'
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update the calendar event details.' : 'Create a new calendar event for your school.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData({...formData, event_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term_start">Term Start</SelectItem>
                      <SelectItem value="term_end">Term End</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="red_day">Red Day</SelectItem>
                      <SelectItem value="school_event">School Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveEvent} className="flex-1">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Term Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-teal" />
              <h4 className="font-medium text-gray-900">Term Dates</h4>
            </div>
            <div className="space-y-3">
              {termEvents.length > 0 ? (
                termEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium">{event.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getEventTypeColor(event.event_type)}>
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(event.start_date), 'MMM d, yyyy')}
                            {event.end_date && event.end_date !== event.start_date && 
                              ` - ${format(new Date(event.end_date), 'MMM d, yyyy')}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No term dates added yet.</p>
              )}
            </div>
          </div>

          {/* Holidays & Red Days */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
              <h4 className="font-medium text-gray-900">Holidays & Red Days</h4>
            </div>
            <div className="space-y-3">
              {holidayEvents.length > 0 ? (
                holidayEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium text-red-900">{event.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {format(new Date(event.start_date), 'MMM d, yyyy')}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-red-700 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No holidays added yet.</p>
              )}
            </div>
          </div>

          {/* All Events Summary */}
          {events.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total events: {events.length} | These events will appear in all teachers' and doctors' calendars for {teacher.school}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCalendarManager;