
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClassSchedule {
  id: string;
  lesson_topic: string;
  subject: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
}

interface EnhancedClassCardProps {
  classItem: ClassSchedule;
  onProvideFeedback: (scheduleId: string) => void;
}

const EnhancedClassCard: React.FC<EnhancedClassCardProps> = ({
  classItem,
  onProvideFeedback
}) => {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
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

  const isUpcoming = () => {
    const classDateTime = new Date(`${classItem.class_date}T${classItem.class_time}`);
    return classDateTime > new Date();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-brand-dark mb-2">
              {classItem.lesson_topic}
            </h3>
            <Badge variant="outline" className="mb-2">
              {classItem.subject}
            </Badge>
            {classItem.description && (
              <p className="text-sm text-gray-600 mb-3">
                {classItem.description}
              </p>
            )}
          </div>
          <Badge variant={isUpcoming() ? "default" : "secondary"}>
            {isUpcoming() ? t('class.upcoming') || 'Upcoming' : t('class.past') || 'Past'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(classItem.class_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(classItem.class_time)} ({classItem.duration_minutes} min)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onProvideFeedback(classItem.id)}
            className="flex items-center gap-2"
            disabled={isUpcoming()}
          >
            <MessageSquare className="w-4 h-4" />
            {t('class.provideFeedback') || 'Provide Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedClassCard;
