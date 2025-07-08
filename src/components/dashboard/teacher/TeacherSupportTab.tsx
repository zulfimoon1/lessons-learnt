import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquareIcon, UserIcon, PhoneIcon, ClockIcon, MailIcon, MapPinIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TeacherSupportChatWidget from "@/components/TeacherSupportChatWidget";

interface TeacherSupportTabProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    school: string;
  };
}

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
}

const TeacherSupportTab: React.FC<TeacherSupportTabProps> = ({ teacher }) => {
  const [psychologists, setPsychologists] = useState<SchoolPsychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [teacher.school, teacher.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch school psychologists - this table exists
      const { data: psychData, error: psychError } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', teacher.school);

      if (psychError) throw psychError;
      setPsychologists(psychData || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crisis Resources */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangleIcon className="h-5 w-5" />
            Crisis Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">Emergency Contacts</h4>
              <div className="text-sm space-y-1">
                <div>National Suicide Prevention Lifeline: 988</div>
                <div>Crisis Text Line: Text HOME to 741741</div>
                <div>Emergency Services: 911</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">When to Seek Immediate Help</h4>
              <div className="text-sm space-y-1">
                <div>• Student expresses suicidal thoughts</div>
                <div>• Evidence of self-harm</div>
                <div>• Immediate safety concerns</div>
                <div>• Severe behavioral changes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Setup Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircleIcon className="h-5 w-5" />
            Feature Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            The teacher-psychologist chat feature is ready but requires database tables to be created first.
          </p>
          <p className="text-sm text-orange-600 mb-4">
            Once the database migration is approved, teachers will be able to:
          </p>
          <ul className="list-disc list-inside text-sm text-orange-600 space-y-1 mb-4">
            <li>Start live chat sessions with school psychologists</li>
            <li>Request support for different categories (student concerns, wellness, etc.)</li>
            <li>View chat history and session records</li>
            <li>Send anonymous support requests when needed</li>
          </ul>
        </CardContent>
      </Card>

      {/* School Psychologists */}
      {psychologists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-brand-teal" />
              School Mental Health Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {psychologists.map((psychologist) => (
                <div key={psychologist.id} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-semibold text-lg">{psychologist.name}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${psychologist.email}`} className="text-brand-teal hover:underline">
                        {psychologist.email}
                      </a>
                    </div>
                    
                    {psychologist.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${psychologist.phone}`} className="text-brand-teal hover:underline">
                          {psychologist.phone}
                        </a>
                      </div>
                    )}
                    
                    {psychologist.office_location && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span>{psychologist.office_location}</span>
                      </div>
                    )}
                    
                    {psychologist.availability_hours && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span>{psychologist.availability_hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No psychologists message */}
      {psychologists.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                No School Psychologist Assigned
              </h3>
              <p className="text-yellow-700 mb-4">
                Your school doesn't have a psychologist registered in the system yet.
              </p>
              <p className="text-sm text-yellow-600">
                Contact your school administrator to add mental health professionals to the platform.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Chat Widget */}
      <TeacherSupportChatWidget teacher={teacher} />
    </div>
  );
};

export default TeacherSupportTab;