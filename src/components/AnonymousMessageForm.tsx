
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
        title: "Message required",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!formData.selectedPsychologist && psychologists.length > 0) {
      toast({
        title: "Psychologist required",
        description: "Please select a psychologist to contact",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const messageData = {
        student_id: formData.isAnonymous ? null : student?.id,
        psychologist_id: formData.selectedPsychologist || psychologists[0]?.id,
        school: student?.school || "",
        grade: student?.grade || "",
        student_name: formData.isAnonymous ? null : (formData.studentName || student?.full_name),
        is_anonymous: formData.isAnonymous,
        message: formData.message.trim(),
        status: 'pending'
      };

      console.log('Submitting message:', messageData);

      const { error } = await supabase
        .from('student_psychologist_messages')
        .insert([messageData]);

      if (error) throw error;

      toast({
        title: t('dashboard.messageSent') || "Message sent successfully",
        description: formData.isAnonymous 
          ? "Your anonymous message has been sent to the school psychologist"
          : "Your message has been sent to the school psychologist",
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
        title: t('common.error') || "Error",
        description: "Failed to send message. Please try again.",
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
          {t('dashboard.contactForSupport') || "Contact for Support"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5" />
            {t('dashboard.contactPsychologist') || "Contact School Psychologist"}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard.confidentialMessage') || "Send a confidential message to your school's mental health support team."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {psychologists.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="psychologist">
                {t('dashboard.selectPsychologist') || "Select Psychologist"}
              </Label>
              <select
                id="psychologist"
                value={formData.selectedPsychologist}
                onChange={(e) => setFormData(prev => ({ ...prev, selectedPsychologist: e.target.value }))}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choose a psychologist...</option>
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
              {t('dashboard.yourMessage') || "Your Message"} *
            </Label>
            <Textarea
              id="message"
              placeholder={t('dashboard.messagePlaceholder') || "Share what's on your mind. Your message will be handled confidentially..."}
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
              {t('dashboard.sendAnonymously') || "Send anonymously"}
            </Label>
          </div>

          {!formData.isAnonymous && (
            <div className="space-y-2">
              <Label htmlFor="studentName">
                {t('student.yourName') || "Your Name"} (optional)
              </Label>
              <Input
                id="studentName"
                type="text"
                placeholder={student?.full_name || "Enter your name"}
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
              {t('dashboard.privacyNote') || "Your privacy is protected. Messages are handled confidentially by qualified mental health professionals."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              {t('common.cancel') || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                t('dashboard.sending') || "Sending..."
              ) : (
                <>
                  <SendIcon className="w-4 h-4 mr-2" />
                  {t('dashboard.sendMessage') || "Send Message"}
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
