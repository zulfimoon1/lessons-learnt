
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartHandshakeIcon, Shield, MessageCircle, Users, Phone, MapPin, Clock, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LiveChatWidget from "@/components/LiveChatWidget";
import { supabase } from "@/integrations/supabase/client";

interface SchoolDoctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
  specialization?: string;
  role: string;
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
  const [error, setError] = useState<string | null>(null);

  console.log('MentalHealthSupportTab: Rendering with school:', studentSchool);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!studentSchool) {
        console.log('MentalHealthSupportTab: No school provided');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      console.log('MentalHealthSupportTab: Fetching doctors for school:', studentSchool);
      
      try {
        // Fetch verified medical professionals only
        const { data: teacherDoctors, error: teacherError } = await supabase
          .from('teachers')
          .select('id, name, email, specialization, role')
          .eq('school', studentSchool)
          .eq('role', 'doctor');

        if (teacherError) {
          console.error('MentalHealthSupportTab: Error fetching doctor teachers:', teacherError);
        } else {
          console.log('MentalHealthSupportTab: Found teacher doctors:', teacherDoctors);
        }

        // Also get any verified psychologists from the school_psychologists table
        const { data: schoolPsychologists, error: psychError } = await supabase
          .from('school_psychologists')
          .select('*')
          .eq('school', studentSchool);

        if (psychError) {
          console.error('MentalHealthSupportTab: Error fetching school psychologists:', psychError);
          // Don't treat this as a fatal error, just log it
        } else {
          console.log('MentalHealthSupportTab: Found school psychologists:', schoolPsychologists);
        }

        // Combine both sources of verified medical professionals
        const combinedDoctors: SchoolDoctor[] = [
          ...(teacherDoctors || []).map(doctor => ({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            role: 'doctor'
          })),
          ...(schoolPsychologists || []).map(psych => ({
            id: psych.id,
            name: psych.name,
            email: psych.email,
            phone: psych.phone,
            office_location: psych.office_location,
            availability_hours: psych.availability_hours,
            role: 'psychologist'
          }))
        ];

        console.log('MentalHealthSupportTab: Combined doctors:', combinedDoctors);
        setDoctors(combinedDoctors);
      } catch (error) {
        console.error('MentalHealthSupportTab: Error fetching medical professionals:', error);
        setError('Failed to load mental health professionals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [studentSchool]);

  const DoctorCard = ({ doctor }: { doctor: SchoolDoctor }) => (
    <div className="border border-purple-100 rounded-lg p-4 bg-purple-50/50 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
            <div className="flex gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {doctor.role === 'doctor' ? 'School Doctor' : 'School Psychologist'}
              </span>
              {doctor.specialization && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {doctor.specialization}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>{doctor.email}</span>
        </div>
        
        {doctor.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{doctor.phone}</span>
          </div>
        )}
        
        {doctor.availability_hours && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{doctor.availability_hours}</span>
          </div>
        )}
        
        {doctor.office_location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{doctor.office_location}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-purple-200">
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => window.location.href = `mailto:${doctor.email}`}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact {doctor.role === 'doctor' ? 'Doctor' : 'Psychologist'}
        </Button>
      </div>
    </div>
  );

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
          {/* Privacy notice */}
          <div className="bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">{t('mentalHealth.confidentialSupport') || 'Confidential Support'}</span>
            </div>
            <p className="text-sm text-blue-700">
              {t('mentalHealth.privacyNotice') || 'All conversations with mental health professionals are strictly confidential and secure.'}
            </p>
          </div>
          
          {/* Live Chat Section */}
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

          {/* Error display */}
          {error && (
            <div className="bg-red-50/50 p-4 rounded-lg border-l-4 border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* School Mental Health Professionals */}
          {doctors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t('mentalHealth.schoolProfessionals') || 'School Mental Health Professionals'}
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {doctors.length} Available
                </span>
              </div>
              
              <div className="grid gap-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <HeartHandshakeIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <p className="text-brand-dark font-medium mb-2">
                {t('mentalHealth.noProfessionalsAtSchool') || 'No dedicated mental health professionals registered at your school yet'}
              </p>
              <p className="text-brand-dark/60 text-sm mb-4">
                {t('mentalHealth.generalSupportAvailable') || 'General support is still available through live chat above'}
              </p>
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
