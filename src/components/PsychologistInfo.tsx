
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, PhoneIcon, MailIcon, MapPinIcon, ClockIcon, UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Psychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  availability_hours?: string;
  office_location?: string;
}

interface PsychologistInfoProps {
  school: string;
}

const PsychologistInfo = ({ school }: PsychologistInfoProps) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchPsychologists();
  }, [school]);

  const fetchPsychologists = async () => {
    try {
      const { data, error } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', school);

      if (error) throw error;
      setPsychologists(data || []);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactClick = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Student Support Request&body=Hello ${name},%0D%0A%0D%0AI would like to schedule a meeting to discuss some concerns.%0D%0A%0D%0AThank you.`;
    
    toast({
      title: "Email client opened",
      description: `Opening email to contact ${name}`,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading support information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (psychologists.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <HeartIcon className="w-5 h-5" />
          Student Support & Wellbeing
        </CardTitle>
        <CardDescription>
          Your school's mental health and wellbeing support team is here to help
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {psychologists.map((psychologist) => (
          <div key={psychologist.id} className="border border-purple-100 rounded-lg p-4 bg-purple-50/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{psychologist.name}</h4>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    School Psychologist
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => handleContactClick(psychologist.email, psychologist.name)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                Contact for Support
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MailIcon className="w-4 h-4" />
                <span>{psychologist.email}</span>
              </div>
              
              {psychologist.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{psychologist.phone}</span>
                </div>
              )}
              
              {psychologist.availability_hours && (
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>{psychologist.availability_hours}</span>
                </div>
              )}
              
              {psychologist.office_location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{psychologist.office_location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-800">
            <strong>Remember:</strong> Your mental health and wellbeing matter. Don't hesitate to reach out if you need someone to talk to or if you're going through a difficult time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PsychologistInfo;
