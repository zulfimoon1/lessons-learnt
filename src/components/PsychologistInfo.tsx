
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, PhoneIcon, MapPinIcon, ClockIcon, UserIcon, MessageCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  availability_hours?: string;
  office_location?: string;
}

interface PsychologistInfoProps {
  psychologist: SchoolPsychologist;
}

const PsychologistInfo = ({ psychologist }: PsychologistInfoProps) => {
  const { toast } = useToast();

  const handleAskTheDoctor = () => {
    // This would integrate with your live chat system
    // For now, we'll show a toast indicating the feature is being activated
    toast({
      title: "Connecting to Live Chat",
      description: `Starting live chat session with ${psychologist.name}`,
    });
    
    // TODO: Integrate with actual live chat service
    console.log('Initiating live chat with psychologist:', psychologist.name);
  };

  return (
    <div className="border border-purple-100 rounded-lg p-4 bg-purple-50/50">
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
          onClick={handleAskTheDoctor}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          <MessageCircleIcon className="w-4 h-4 mr-2" />
          Ask the Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
  );
};

export default PsychologistInfo;
