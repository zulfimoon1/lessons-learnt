
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { MessageCircleIcon, SendIcon, ShieldCheckIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnonymousMessageFormProps {
  psychologists: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

const AnonymousMessageForm = ({ psychologists }: AnonymousMessageFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { student } = useAuthStorage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    isAnonymous: true,
    selectedPsychologist: "",
    studentName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: t('common.messageRequired'),
        description: t('common.pleaseEnterMessage'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.selectedPsychologist && psychologists.length > 0) {
      toast({
        title: t('common.psychologistRequired'),
        description: t('common.pleaseSelectPsychologist'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll store these as mental health alerts until the proper table is created
      const alertData = {
        student_id: formData.isAnonymous ? null : student?.id,
        student_name: formData.isAnonymous ? t('common.anonymousStudent') : (formData.studentName || student?.full_name || t('common.unknown')),
        school: student?.school || "",
        grade: student?.grade || "",
        content: `SUPPORT REQUEST: ${formData.message.trim()}`,
        source_table: 'student_support_request',
        source_id: crypto.randomUUID(),
        severity_level: 1,
        alert_type: 'support_request'
      };

      console.log('Submitting support request:', alertData);

      const { error } = await supabase
        .from('mental_health_alerts')
        .insert([alertData]);

      if (error) throw error;

      toast({
        title: t('dashboard.messageSent'),
        description: formData.isAnonymous 
          ? t('common.anonymousMessageSent')
          : t('common.messageSentToSchoolPsychologist'),
      });

      // Reset form
      setFormData({
        message: "",
        isAnonymous: true,
        selectedPsychologist: "",
        studentName: ""
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('common.error'),
        description: t('common.failedToSendMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <MessageCircleIcon className="w-4 h-4 mr-2" />
          {t('dashboard.contactForSupport')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5" />
            {t('dashboard.contactPsychologist')}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard.confidentialMessage')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {psychologists.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="psychologist">
                {t('dashboard.selectPsychologist')}
              </Label>
              <select
                id="psychologist"
                value={formData.selectedPsychologist}
                onChange={(e) => setFormData(prev => ({ ...prev, selectedPsychologist: e.target.value }))}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('common.choosePsychologist')}</option>
                {psychologists.map((psychologist) => (
                  <option key={psychologist.id} value={psychologist.id}>
                    {psychologist.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">
              {t('dashboard.yourMessage')} *
            </Label>
            <Textarea
              id="message"
              placeholder={t('dashboard.messagePlaceholder')}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked as boolean }))}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4" />
              {t('dashboard.sendAnonymously')}
            </Label>
          </div>

          {!formData.isAnonymous && (
            <div className="space-y-2">
              <Label htmlFor="studentName">
                {t('student.yourName')} (optional)
              </Label>
              <Input
                id="studentName"
                type="text"
                placeholder={student?.full_name || t('common.enterYourName')}
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
              {t('dashboard.privacyNote')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                t('dashboard.sending')
              ) : (
                <>
                  <SendIcon className="w-4 h-4 mr-2" />
                  {t('dashboard.sendMessage')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnonymousMessageForm;
