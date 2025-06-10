
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenIcon, LockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { resetPassword } from "@/services/passwordResetService";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidToken(true);
      } else {
        // No valid session, redirect to login
        toast({
          title: language === 'lt' ? 'Netinkama nuoroda' : 'Invalid Link',
          description: language === 'lt' ? 'Slaptažodžio atstatymo nuoroda netinkama arba pasibaigė jos galiojimas.' : 'The password reset link is invalid or has expired.',
          variant: "destructive",
        });
        navigate('/teacher-login');
      }
    };

    checkSession();
  }, [navigate, toast, language]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: t('teacher.missingInfo'),
        description: language === 'lt' ? 'Užpildykite visus laukus' : 'Please fill in all fields',
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('auth.passwordMismatch'),
        description: t('auth.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(password);
      
      if (result.error) {
        toast({
          title: language === 'lt' ? 'Klaida' : 'Error',
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === 'lt' ? 'Sėkmė' : 'Success',
          description: language === 'lt' ? 'Slaptažodis sėkmingai atnaujintas' : 'Password updated successfully',
        });
        navigate('/teacher-login');
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

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            {language === 'lt' ? 'Atstatyti slaptažodį' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {language === 'lt' ? 'Įveskite naują slaptažodį' : 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <LockIcon className="w-4 h-4" />
                {language === 'lt' ? 'Naujas slaptažodis' : 'New Password'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={language === 'lt' ? 'Įveskite naują slaptažodį' : 'Enter new password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === 'lt' ? 'Patvirtinkite slaptažodį' : 'Confirm Password'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={language === 'lt' ? 'Patvirtinkite naują slaptažodį' : 'Confirm new password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                language === 'lt' ? 'Atnaujinama...' : 'Updating...'
              ) : (
                <>
                  <LockIcon className="w-4 h-4 mr-2" />
                  {language === 'lt' ? 'Atnaujinti slaptažodį' : 'Update Password'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
