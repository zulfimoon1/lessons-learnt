
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HeartHandshakeIcon, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LiveChatWidget from "@/components/LiveChatWidget";
import PsychologistInfo from "@/components/PsychologistInfo";
import { supabase } from "@/integrations/supabase/client";

interface SchoolDoctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
  specialization?: string;
}

interface MentalHealthSupportTabProps {
  psychologists: SchoolDoctor[];
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
  const [doctors, setDoctors] = useState<SchoolDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!studentSchool) return;
      
      setIsLoading(true);
      try {
        // Fetch verified medical professionals only
        const { data: teacherDoctors, error: teacherError } = await supabase
          .from('teachers')
          .select('id, name, email, specialization')
          .eq('school', studentSchool)
          .eq('role', 'doctor');

        if (teacherError) {
          console.error('Error fetching doctor teachers:', teacherError);
        }

        // Also get any verified psychologists from the school_psychologists table
        const { data: schoolPsychologists, error: psychError } = await supabase
          .from('school_psychologists')
          .select('*')
          .eq('school', studentSchool);

        if (psychError) {
          console.error('Error fetching school psychologists:', psychError);
        }

        // Combine both sources of verified medical professionals
        const combinedDoctors: SchoolDoctor[] = [
          ...(teacherDoctors || []).map(doctor => ({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization
          })),
          ...(schoolPsychologists || []).map(psych => ({
            id: psych.id,
            name: psych.name,
            email: psych.email,
            phone: psych.phone,
            office_location: psych.office_location,
            availability_hours: psych.availability_hours
          }))
        ];

        setDoctors(combinedDoctors);
      } catch (error) {
        console.error('Error fetching medical professionals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [studentSchool]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="ml-3 text-brand-dark">{t('mentalHealth.loading')}</span>
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
          <Shield className="w-4 h-4 ml-2 opacity-80" />
        </CardTitle>
        <CardDescription className="text-white/80">
          {t('student.accessMentalHealthResources', { school: studentSchool })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">{t('chat.privacyProtected')}</span>
            </div>
            <p className="text-sm text-blue-700">
              {t('chat.conversationConfidential')}
            </p>
          </div>
          
          {/* Live Chat Widget - Always Available and Centered */}
          <div className="flex justify-center py-4">
            <LiveChatWidget
              studentId={studentId}
              studentName={studentName || t('student.defaultName')}
              school={studentSchool || ""}
              grade={studentGrade || ""}
            />
          </div>
          
          {/* Show doctor information if available */}
          {doctors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-dark">
                {t('features.mentalHealth.title')} - {t('admin.subscription')}
              </h3>
              {doctors.map((doctor) => (
                <PsychologistInfo key={doctor.id} psychologist={doctor} />
              ))}
            </div>
          )}
          
          {/* Information when no doctors available */}
          {doctors.length === 0 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <HeartHandshakeIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <p className="text-brand-dark font-medium mb-2">{t('dashboard.noPsychologists')}</p>
              <p className="text-brand-dark/60 text-sm mb-4">
                {t('dashboard.contactAdmin')}
              </p>
              
              <div className="bg-green-50/50 p-4 rounded-lg border-l-4 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">{t('chat.chatStarted')}</span>
                </div>
                <p className="text-sm text-green-700">
                  {t('chat.doctorWillJoin')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MentalHealthSupportTab.displayName = "MentalHealthSupportTab";

export default MentalHealthSupportTab;
