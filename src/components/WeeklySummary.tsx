
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, BookOpenIcon, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WeeklySummaryProps {
  onClose: () => void;
}

const WeeklySummary = ({ onClose }: WeeklySummaryProps) => {
  const [emotionalConcerns, setEmotionalConcerns] = useState("");
  const [academicConcerns, setAcademicConcerns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { student } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emotionalConcerns.trim() && !academicConcerns.trim()) {
      toast({
        title: "Please fill in at least one concern",
        description: "Share your thoughts about this week",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('weekly_summaries')
        .insert({
          student_id: student?.id,
          student_name: student?.full_name || '',
          school: student?.school || '',
          grade: student?.grade || '',
          emotional_concerns: emotionalConcerns.trim() || null,
          academic_concerns: academicConcerns.trim() || null,
          week_start_date: getStartOfWeek(new Date())
        });

      if (error) throw error;

      toast({
        title: t('weekly.success'),
        description: "Your weekly summary helps us understand how to better support you.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit weekly summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">{t('weekly.title')}</CardTitle>
          <CardDescription className="text-lg">
            {t('weekly.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-700 font-medium">{t('weekly.question')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="emotional" className="flex items-center gap-2 text-base font-medium">
                  <HeartIcon className="w-5 h-5 text-pink-500" />
                  {t('weekly.emotional')}
                </Label>
                <Badge variant="outline" className="mb-2 bg-pink-50 text-pink-700 border-pink-200">
                  Optional
                </Badge>
                <Textarea
                  id="emotional"
                  placeholder="Share any emotional concerns, stress, friendship issues, or how you're feeling about school..."
                  value={emotionalConcerns}
                  onChange={(e) => setEmotionalConcerns(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div>
                <Label htmlFor="academic" className="flex items-center gap-2 text-base font-medium">
                  <BookOpenIcon className="w-5 h-5 text-blue-500" />
                  {t('weekly.academic')}
                </Label>
                <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                  Optional
                </Badge>
                <Textarea
                  id="academic"
                  placeholder="Share any concerns about homework, understanding subjects, keeping up with classes, or academic challenges..."
                  value={academicConcerns}
                  onChange={(e) => setAcademicConcerns(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? t('loading') : t('weekly.submit')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummary;
