
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, BookOpenIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import EnhancedClassCard from "@/components/dashboard/student/EnhancedClassCard";

interface ClassSchedule {
  id: string;
  lesson_topic: string;
  subject: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
}

interface UpcomingClassesTabProps {
  classes: ClassSchedule[];
  studentGrade: string;
  studentSchool: string;
}

const UpcomingClassesTab: React.FC<UpcomingClassesTabProps> = ({
  classes,
  studentGrade,
  studentSchool
}) => {
  const { t } = useLanguage();

  const handleProvideFeedback = (scheduleId: string) => {
    // This would typically navigate to a feedback form
    console.log('Tell us about class:', scheduleId);
  };

  if (classes.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CalendarIcon className="w-5 h-5" />
            My Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpenIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              No classes coming up right now!
            </h3>
            <p className="text-blue-600">
              Don't worry - new classes will show up here when they're scheduled. 
              Check back later or ask your teacher when the next class will be!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border-brand-teal/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-teal" />
            My Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brand-teal" />
              <div>
                <p className="text-sm text-muted-foreground">My School</p>
                <p className="font-medium">{studentSchool}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-brand-orange" />
              <div>
                <p className="text-sm text-muted-foreground">My Grade</p>
                <p className="font-medium">{studentGrade}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-brand-teal" />
              <div>
                <p className="text-sm text-muted-foreground">Classes Coming Up</p>
                <p className="font-medium">{classes.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <EnhancedClassCard
            key={classItem.id}
            classItem={classItem}
            onProvideFeedback={handleProvideFeedback}
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingClassesTab;
