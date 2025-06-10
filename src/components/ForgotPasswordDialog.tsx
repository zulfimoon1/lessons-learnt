
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendPasswordResetEmail } from "@/services/passwordResetService";

interface ForgotPasswordDialogProps {
  children: React.ReactNode;
}

const ForgotPasswordDialog = ({ children }: ForgotPasswordDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: language === 'lt' ? 'Trūksta informacijos' : 'Missing Information',
        description: language === 'lt' ? 'Įveskite savo el. pašto adresą' : 'Please enter your email address',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendPasswordResetEmail(email);
      
      if (result.error) {
        toast({
          title: language === 'lt' ? 'Klaida' : 'Error',
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === 'lt' ? 'El. laiškas išsiųstas' : 'Email Sent',
          description: language === 'lt' 
            ? 'Jei toks el. pašto adresas egzistuoja, išsiuntėme slaptažodžio atstatymo nuorodą'
            : 'If the email exists, we have sent a password reset link',
        });
        setIsOpen(false);
        setEmail("");
      }
    } catch (error) {
      toast({
        title: language === 'lt' ? 'Klaida' : 'Error',
        description: language === 'lt' ? 'Įvyko netikėta klaida' : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {language === 'lt' ? 'Pamiršau slaptažodį' : 'Forgot Password'}
          </DialogTitle>
          <DialogDescription>
            {language === 'lt' 
              ? 'Įveskite savo el. pašto adresą ir mes išsiųsime slaptažodžio atstatymo nuorodą.'
              : 'Enter your email address and we will send you a password reset link.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resetEmail">
              {language === 'lt' ? 'El. pašto adresas' : 'Email Address'}
            </Label>
            <Input
              id="resetEmail"
              type="email"
              placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {language === 'lt' ? 'Atšaukti' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                language === 'lt' ? 'Siunčiama...' : 'Sending...'
              ) : (
                language === 'lt' ? 'Siųsti nuorodą' : 'Send Link'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
