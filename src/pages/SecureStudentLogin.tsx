
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSafeLanguage } from "@/contexts/SafeLanguageContext";
import { useSafeAuth } from "@/contexts/SafeAuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import SecureStudentLoginForm from "@/components/auth/SecureStudentLoginForm";
import StudentSignupForm from "@/components/auth/StudentSignupForm";
import SessionSecurityMonitor from "@/components/security/SessionSecurityMonitor";

const SecureStudentLogin = () => {
  const { t } = useSafeLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { student, isLoading: authLoading, studentLogin, studentSignup } = useSafeAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student && !authLoading) {
      console.log('Student already logged in, redirecting to dashboard');
      navigate("/student-dashboard", { replace: true });
    }
  }, [student, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-2 text-brand-dark">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const handleSecureLogin = async (fullName: string, school: string, grade: string, password: string) => {
    if (!fullName.trim() || !school.trim() || !grade.trim() || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('SecureStudentLogin: Attempting login for:', { fullName, school, grade });
      const result = await studentLogin(fullName, school, grade, password);

      if (result.error) {
        console.log('SecureStudentLogin: Login failed with error:', result.error);
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('SecureStudentLogin: Login successful, navigating to dashboard');
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        setTimeout(() => {
          navigate("/student-dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('SecureStudentLogin: Login error:', err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (fullName: string, school: string, grade: string, password: string, confirmPassword: string) => {
    if (!fullName.trim() || !school.trim() || !grade.trim() || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await studentSignup(fullName.trim(), school.trim(), grade.trim(), password);

      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        toast({
          title: "Account created!",
          description: "Welcome to Lesson Lens!",
        });
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: "Signup failed",
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
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-brand-dark">{t('login.student.title') || 'Student Login'}</CardTitle>
            <CardDescription className="text-gray-600">
              {t('login.student.subtitle') || 'Sign in to access your student dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('auth.login') || 'Login'}</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('auth.signUp') || 'Sign Up'}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <SecureStudentLoginForm onLogin={handleSecureLogin} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="signup">
                <StudentSignupForm onSignup={handleSignup} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecureStudentLogin;
