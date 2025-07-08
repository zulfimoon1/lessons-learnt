import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, X, User } from "lucide-react";

interface AttendanceTrackerProps {
  classInfo: {
    id: string;
    lesson_topic: string;
    subject: string;
    class_date: string;
    class_time: string;
  };
  onAttendanceConfirmed: (attended: boolean, reason?: string) => void;
  onBack: () => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  classInfo,
  onAttendanceConfirmed,
  onBack
}) => {
  const [attendance, setAttendance] = React.useState<'yes' | 'no' | null>(null);
  const [reason, setReason] = React.useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
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

  const handleSubmit = () => {
    if (attendance === 'yes') {
      onAttendanceConfirmed(true);
    } else if (attendance === 'no') {
      onAttendanceConfirmed(false, reason);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <User className="w-6 h-6" />
          Did you attend this class?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{classInfo.lesson_topic}</h3>
          <p className="text-gray-600 mb-1">{classInfo.subject}</p>
          <p className="text-sm text-gray-500">
            {formatDate(classInfo.class_date)} at {formatTime(classInfo.class_time)}
          </p>
        </div>

        <RadioGroup value={attendance || ''} onValueChange={(value) => setAttendance(value as 'yes' | 'no')}>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes" className="flex items-center gap-2 cursor-pointer">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Yes, I was there!
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no" className="flex items-center gap-2 cursor-pointer">
              <X className="w-4 h-4 text-orange-500" />
              No, I missed it
            </Label>
          </div>
        </RadioGroup>

        {attendance === 'no' && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Why did you miss class? (optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="I was sick, had a doctor's appointment, etc..."
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!attendance}
            className="flex-1"
          >
            {attendance === 'yes' ? 'Continue to Feedback' : 'Save & Done'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;