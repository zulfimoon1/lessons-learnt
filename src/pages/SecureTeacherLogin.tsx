import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCapIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import SecureTeacherLoginForm from "@/components/auth/SecureTeacherLoginForm";
import TeacherSignupForm from "@/components/auth/TeacherSignupForm";
import SessionSecurityMonitor from "@/components/security/SessionSecurityMonitor";
import { loginTeacher, signupTeacher } from "@/services/authIntegrationService";

const SecureTeacherLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, isLoading: authLoading, setTeacher } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Get the tab from URL params, default to 'signup' if tab=signup is in URL, otherwise 'login'
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  useEffect(() => {
    if (teacher && !authLoading) {
      navigate("/teacher-dashboard", { replace: true });
    }
  }, [teacher, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-2 text-brand-dark">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const handleSecureLogin = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginTeacher(email, password);

      if (result.error) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        setTeacher(result.teacher);
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate("/teacher-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, school: string, password: string, confirmPassword: string, role: string) => {
    if (!name.trim() || !email.trim() || !school.trim() || !password || !confirmPassword) {
      toast({
        title: t('teacher.missingInfo') || "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('teacher.passwordMismatch') || "Password mismatch",
        description: t('teacher.passwordsDoNotMatch') || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupTeacher(name.trim(), email.trim(), school.trim(), password, role);

      if (result.error) {
        toast({
          title: t('teacher.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        setTeacher(result.teacher);
        toast({
          title: t('teacher.accountCreated') || "Account created!",
          description: t('teacher.welcomeToApp') || "Welcome to Lesson Lens!",
        });
        navigate("/teacher-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: t('teacher.signupFailed') || "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center p-4">
      <AuthHeader />
      
      <div className="w-full max-w-md">
        <SessionSecurityMonitor />
        <Card className="bg-white/95 backdrop-blur-sm border-brand-teal/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-brand-teal rounded-full mx-auto flex items-center justify-center mb-4">
              <GraduationCapIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-brand-dark">{t('login.teacher.title')}</CardTitle>
            <CardDescription className="text-gray-600">
              {t('login.teacher.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('auth.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <SecureTeacherLoginForm onLogin={handleSecureLogin} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="signup">
                <TeacherSignupForm onSignup={handleSignup} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecureTeacherLogin;
