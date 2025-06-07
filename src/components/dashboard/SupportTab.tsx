
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshakeIcon } from "lucide-react";
import PsychologistInfo from "@/components/PsychologistInfo";
import LiveChatWidget from "@/components/LiveChatWidget";
import { useLanguage } from "@/contexts/LanguageContext";

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
}

interface Student {
  school?: string;
}

interface SupportTabProps {
  psychologists: SchoolPsychologist[];
  student: Student | null;
}

const SupportTab = ({ psychologists, student }: SupportTabProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshakeIcon className="w-5 h-5" />
          Mental Health Support
        </CardTitle>
        <CardDescription>
          Access mental health resources and support at {student?.school}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {psychologists.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <LiveChatWidget />
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
            <p className="text-muted-foreground">No psychologists found for your school</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact your school administrator for mental health resources
            </p>
            <div className="mt-4">
              <LiveChatWidget />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportTab;
