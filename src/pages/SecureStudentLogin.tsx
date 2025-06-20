
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import SecureStudentLoginForm from "@/components/auth/SecureStudentLoginForm";
import StudentSignupForm from "@/components/auth/StudentSignupForm";
import SessionSecurityMonitor from "@/components/security/SessionSecurityMonitor";
import { authenticateStudent, registerStudent } from "@/services/properAuthService";

const SecureStudentLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { student, isLoading: authLoading, setStudent } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (student && !authLoading) {
      navigate("/student-dashboard", { replace: true });
    }
  }, [student, authLoading, navigate]);

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

  const handleSecureLogin = async (fullName: string, school: string, grade: string, password: string) => {
    if (!fullName.trim() || !school.trim() || !grade.trim() || !password) {
      toast({
        title: "Missing information",
        description: "Please enter your full name, school, grade, and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authenticateStudent(fullName.trim(), school.trim(), grade.trim(), password);

      if (result.error) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        // Set the student in auth context
        setStudent(result.student);
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate("/student-dashboard", { replace: true });
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

  const handleSignup = async (fullName: string, school: string, grade: string, password: string, confirmPassword: string) => {
    if (!fullName.trim() || !school.trim() || !grade.trim() || !password || !confirmPassword) {
      toast({
        title: t('teacher.missingInfo') || "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('student.passwordMismatch') || "Password mismatch",
        description: t('student.passwordsDoNotMatch') || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerStudent(fullName.trim(), school.trim(), grade.trim(), password);

      if (result.error) {
        toast({
          title: t('student.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        // Set the student in auth context
        setStudent(result.student);
        toast({
          title: t('student.accountCreated') || "Account created!",
          description: t('student.welcomeToApp') || "Welcome to Lesson Lens!",
        });
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: t('student.signupFailed') || "Signup failed",
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
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
              <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">{t('login.student.title')}</CardTitle>
            <CardDescription>
              {t('login.student.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
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
