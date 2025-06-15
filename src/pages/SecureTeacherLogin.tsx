import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import SecureTeacherLoginForm from "@/components/auth/SecureTeacherLoginForm";
import TeacherSignupForm from "@/components/auth/TeacherSignupForm";
import SessionSecurityMonitor from "@/components/security/SessionSecurityMonitor";

const SecureTeacherLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, teacherLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (teacher && !authLoading) {
      if (teacher.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/teacher-dashboard", { replace: true });
      }
    }
  }, [teacher, authLoading, navigate]);

  // Don't render if still loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
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
      const result = await teacherLogin(email.trim(), password);

      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        setTimeout(() => {
          if (result.teacher.role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/teacher-dashboard", { replace: true });
          }
        }, 100);
      }
    } catch (err) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (signupData: {
    name: string;
    email: string;
    school: string;
    role: 'teacher' | 'admin' | 'doctor';
    password: string;
    confirmPassword: string;
  }) => {
    if (!signupData.name.trim() || !signupData.email.trim() || !signupData.school.trim() || !signupData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await teacherLogin(
        signupData.email.trim(),
        signupData.password,
        signupData.name.trim(),
        signupData.school.trim(),
        signupData.role
      );

      if (result.error) {
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        toast({
          title: "Account Created Successfully",
          description: "Welcome! Your account has been created.",
        });
        
        setTimeout(() => {
          if (result.teacher.role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/teacher-dashboard", { replace: true });
          }
        }, 100);
      }
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthHeader />
      <div className="w-full max-w-md">
        <SessionSecurityMonitor />
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-foreground">{t('login.teacher.title')}</CardTitle>
            <CardDescription>
              {t('login.teacher.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
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
