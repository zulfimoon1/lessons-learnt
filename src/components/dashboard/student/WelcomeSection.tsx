
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, CalendarIcon, HeartIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeSectionProps {
  studentName: string;
  school: string;
  grade: string;
  upcomingClassesCount: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  studentName,
  school,
  grade,
  upcomingClassesCount
}) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border-brand-teal/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <GraduationCapIcon className="w-6 h-6 text-brand-teal" />
          {t('dashboard.welcome') || 'Welcome'}, {studentName}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <GraduationCapIcon className="w-5 h-5 text-brand-teal" />
            <div>
              <p className="text-sm text-muted-foreground">{t('auth.school') || 'School'}</p>
              <p className="font-medium">{school}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <GraduationCapIcon className="w-5 h-5 text-brand-orange" />
            <div>
              <p className="text-sm text-muted-foreground">{t('auth.grade') || 'Grade'}</p>
              <p className="font-medium">{grade}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-brand-teal" />
            <div>
              <p className="text-sm text-muted-foreground">{t('class.upcomingClasses') || 'Upcoming Classes'}</p>
              <p className="font-medium">{upcomingClassesCount}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <HeartIcon className="w-4 h-4 text-brand-orange" />
            <p className="text-sm">
              {t('dashboard.studentWelcomeMessage') || 'Ready to share your feedback and help improve your learning experience!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
