
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CalendarBooking = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    phone: '',
    timeSlot: '',
    message: ''
  });
  const { toast } = useToast();

  const timeSlots = [
    '9:00 AM - 9:30 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '2:00 PM - 2:30 PM',
    '3:00 PM - 3:30 PM',
    '4:00 PM - 4:30 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create calendar event data
    const eventData = {
      title: `Demo Call with ${formData.name} - ${formData.school}`,
      description: `Demo call scheduled for ${formData.school}\n\nContact: ${formData.email}\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`,
      startTime: formData.timeSlot,
      attendee: formData.email
    };

    // Generate calendar URLs
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(eventData.description)}&add=${encodeURIComponent(formData.email)}`;

    // Outlook Calendar URL
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventData.title)}&body=${encodeURIComponent(eventData.description)}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}`;

    toast({
      title: "Demo Scheduled!",
      description: "Choose your preferred calendar to add the demo appointment.",
    });

    // Open calendar selection
    const calendarChoice = window.confirm("Click OK for Google Calendar, Cancel for Outlook Calendar");
    
    if (calendarChoice) {
      window.open(googleCalendarUrl, '_blank');
    } else {
      window.open(outlookUrl, '_blank');
    }

    setIsOpen(false);
    setFormData({
      name: '',
      email: '',
      school: '',
      phone: '',
      timeSlot: '',
      message: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8 py-4">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Schedule a Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Your Demo
          </DialogTitle>
          <DialogDescription>
            Book a 30-minute demo to see how Lessons Learnt can transform your school
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School Name *</Label>
            <Input
              id="school"
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSlot">Preferred Time Slot *</Label>
            <Select value={formData.timeSlot} onValueChange={(value) => setFormData({...formData, timeSlot: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Notes</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Tell us about your school's needs..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!formData.name || !formData.email || !formData.school || !formData.timeSlot}>
            Schedule Demo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarBooking;
