
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import TeacherLoginForm from "@/components/auth/TeacherLoginForm";
import TeacherSignupForm from "@/components/auth/TeacherSignupForm";

const TeacherLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, teacherLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    console.log('TeacherLogin: Checking auth state', { teacher, authLoading });
    if (teacher && !authLoading) {
      console.log('TeacherLogin: Teacher already logged in, redirecting...');
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

  const handleLogin = async (email: string, password: string) => {
    console.log('TeacherLogin: Login attempt with email:', email);
    
    if (!email.trim() || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLogin: Starting login process with email:', email);

    try {
      const result = await teacherLogin(email.trim(), password);
      console.log('TeacherLogin: Login result received:', result);

      if (result.error) {
        console.error('TeacherLogin: Login failed with error:', result.error);
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        console.log('TeacherLogin: Login successful, redirecting');
        
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
      } else {
        console.error('TeacherLogin: No error but no teacher data returned');
        toast({
          title: "Login Failed",
          description: "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('TeacherLogin: Unexpected error during login:', err);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    toast({
      title: "Signup Not Available",
      description: "Please contact your administrator to create a teacher account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthHeader />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
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
              <TeacherLoginForm onLogin={handleLogin} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="signup">
              <TeacherSignupForm onSignup={handleSignup} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
