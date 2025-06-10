
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HeartHandshakeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LiveChatWidget from "@/components/LiveChatWidget";
import PsychologistInfo from "@/components/PsychologistInfo";

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
}

interface MentalHealthSupportTabProps {
  psychologists: SchoolPsychologist[];
  studentId?: string;
  studentName?: string;
  studentSchool?: string;
  studentGrade?: string;
}

const MentalHealthSupportTab: React.FC<MentalHealthSupportTabProps> = ({
  psychologists,
  studentId,
  studentName,
  studentSchool,
  studentGrade
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshakeIcon className="w-5 h-5" />
          {t('dashboard.mentalHealthSupport')}
        </CardTitle>
        <CardDescription>
          {t('student.accessMentalHealthResources', { school: studentSchool })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {psychologists.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <LiveChatWidget
                studentId={studentId}
                studentName={studentName || t('student.defaultName')}
                school={studentSchool || ""}
                grade={studentGrade || ""}
              />
            </div>
            <div className="space-y-4">
              {psychologists.map((psychologist) => (
                <PsychologistInfo key={psychologist.id} psychologist={psychologist} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <HeartHandshakeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('dashboard.noPsychologists')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.contactAdmin')}
            </p>
            <div className="mt-4">
              <LiveChatWidget
                studentId={studentId}
                studentName={studentName || t('student.defaultName')}
                school={studentSchool || ""}
                grade={studentGrade || ""}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentalHealthSupportTab;
