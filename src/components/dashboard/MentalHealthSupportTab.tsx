
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartHandshakeIcon, Shield, MessageCircle, Users } from "lucide-react";
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
          <span className="ml-3 text-brand-dark">{t('common.loading') || 'Loading...'}</span>
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
          {t('dashboard.mentalHealthSupport') || 'Mental Health Support'}
          <Shield className="w-4 h-4 ml-2 opacity-80" />
        </CardTitle>
        <CardDescription className="text-white/80">
          {t('dashboard.confidentialSupport') || 'Confidential support available 24/7 for'} {studentSchool}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Always show privacy notice */}
          <div className="bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">{t('mentalHealth.confidentialSupport') || 'Confidential Support'}</span>
            </div>
            <p className="text-sm text-blue-700">
              {t('mentalHealth.privacyNotice') || 'All conversations with mental health professionals are strictly confidential and secure.'}
            </p>
          </div>
          
          {/* Prominent Live Chat Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800">
                  {t('mentalHealth.instantSupport') || 'Instant Support Available'}
                </h3>
                <p className="text-sm text-emerald-600">
                  {t('mentalHealth.startConversation') || 'Start a confidential conversation right now'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <LiveChatWidget
                studentId={studentId}
                studentName={studentName || t('student.defaultName') || 'Student'}
                school={studentSchool || ""}
                grade={studentGrade || ""}
              />
            </div>
          </div>

          {/* School Mental Health Professionals */}
          {doctors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t('mentalHealth.schoolProfessionals') || 'School Mental Health Professionals'}
                </h3>
              </div>
              {doctors.map((doctor) => (
                <PsychologistInfo key={doctor.id} psychologist={doctor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <HeartHandshakeIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <p className="text-brand-dark font-medium mb-2">
                {t('mentalHealth.noProfessionalsAtSchool') || 'No dedicated mental health professionals at your school yet'}
              </p>
              <p className="text-brand-dark/60 text-sm mb-4">
                {t('mentalHealth.generalSupportAvailable') || 'General support is still available through live chat'}
              </p>
              
              <div className="bg-yellow-50/50 p-4 rounded-lg border-l-4 border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    {t('mentalHealth.emergencySupport') || 'Emergency Support Available'}
                  </span>
                </div>
                <p className="text-sm text-yellow-700">
                  {t('mentalHealth.alwaysHereToHelp') || 'Our support system is always here to help you. Click the chat button above to get started.'}
                </p>
              </div>
            </div>
          )}

          {/* Emergency Resources */}
          <div className="bg-red-50/50 p-4 rounded-lg border-l-4 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">
                {t('mentalHealth.emergencyResources') || 'Emergency Resources'}
              </span>
            </div>
            <p className="text-sm text-red-700 mb-2">
              {t('mentalHealth.immediateHelp') || 'If you need immediate help, please contact:'}
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• {t('mentalHealth.emergencyNumber') || 'Emergency: 112 (EU) / 911 (US)'}</li>
              <li>• {t('mentalHealth.crisisHotline') || 'Crisis Text Line: Text HOME to 741741'}</li>
              <li>• {t('mentalHealth.schoolCounselor') || 'Your school counselor or trusted adult'}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MentalHealthSupportTab.displayName = "MentalHealthSupportTab";

export default MentalHealthSupportTab;
