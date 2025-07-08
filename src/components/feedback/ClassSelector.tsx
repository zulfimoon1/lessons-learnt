import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, MessageSquare } from "lucide-react";

interface ClassItem {
  id: string;
  lesson_topic: string;
  subject: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
}

interface ClassSelectorProps {
  classes: ClassItem[];
  onClassSelected: (classItem: ClassItem) => void;
  isLoading: boolean;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  onClassSelected,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">Looking for your classes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            All caught up!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              You've shared your thoughts on all your recent classes!
            </h3>
            <p className="text-gray-500">
              Come back after your next class to tell us how it went.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          Which class do you want to tell us about?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onClassSelected(classItem)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {classItem.lesson_topic}
                  </h3>
                  <Badge variant="outline" className="mb-2">
                    {classItem.subject}
                  </Badge>
                  {classItem.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {classItem.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(classItem.class_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(classItem.class_time)}</span>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClassSelected(classItem);
                }}
              >
                Share my thoughts about this class
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSelector;