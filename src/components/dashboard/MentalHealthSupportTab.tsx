
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HeartHandshakeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LiveChatWidget from "@/components/LiveChatWidget";
import PsychologistInfo from "@/components/PsychologistInfo";
import { supabase } from "@/integrations/supabase/client";

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

const MentalHealthSupportTab: React.FC<MentalHealthSupportTabProps> = React.memo(({
  psychologists: initialPsychologists,
  studentId,
  studentName,
  studentSchool,
  studentGrade
}) => {
  const { t } = useLanguage();
  const [psychologists, setPsychologists] = useState<SchoolPsychologist[]>(initialPsychologists);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPsychologists = async () => {
      if (!studentSchool || psychologists.length > 0) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('school_psychologists')
          .select('*')
          .eq('school', studentSchool);

        if (error) {
          console.error('Error fetching psychologists:', error);
        } else if (data) {
          setPsychologists(data);
        }
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPsychologists();
  }, [studentSchool, psychologists.length]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="ml-3 text-brand-dark">Loading mental health support...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <HeartHandshakeIcon className="w-5 h-5" />
          </div>
          {t('dashboard.mentalHealthSupport')}
        </CardTitle>
        <CardDescription className="text-white/80">
          {t('student.accessMentalHealthResources', { school: studentSchool })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
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
            <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <HeartHandshakeIcon className="w-8 h-8 text-brand-teal" />
            </div>
            <p className="text-brand-dark font-medium mb-2">{t('dashboard.noPsychologists')}</p>
            <p className="text-brand-dark/60 text-sm mb-4">
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
});

MentalHealthSupportTab.displayName = "MentalHealthSupportTab";

export default MentalHealthSupportTab;
