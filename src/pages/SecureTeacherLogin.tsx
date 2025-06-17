
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
import EnhancedSecurityMonitor from "@/components/security/EnhancedSecurityMonitor";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

const SecureTeacherLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, teacherLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (teacher && !authLoading) {
      if (teacher.role === 'admin') {
        navigate("/teacher-dashboard", { replace: true });
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

    // Enhanced security validation
    const isSecureAccess = await enhancedSecurityService.validateSecureAccess('teachers', 'SELECT');
    if (!isSecureAccess) {
      toast({
        title: "Security Alert",
        description: "Suspicious activity detected. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Log login attempt
      await enhancedSecurityService.logSecurityViolation({
        type: 'login_attempt',
        details: `Teacher login attempt for email: ${email}`,
        severity: 'low'
      });

      const result = await teacherLogin(email.trim(), password);

      if (result.error) {
        // Log failed login
        await enhancedSecurityService.logSecurityViolation({
          type: 'login_failed',
          details: `Failed login attempt for email: ${email} - ${result.error}`,
          severity: 'medium'
        });

        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        // Log successful login
        await enhancedSecurityService.logSecurityViolation({
          type: 'login_success',
          userId: result.teacher.id,
          details: `Successful teacher login for email: ${email}`,
          severity: 'low'
        });

        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate("/teacher-dashboard", { replace: true });
      }
    } catch (err) {
      // Log login error
      await enhancedSecurityService.logSecurityViolation({
        type: 'login_error',
        details: `Login error for email: ${email} - ${err}`,
        severity: 'medium'
      });

      toast({
        title: "Login failed",
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
    const { name, email, school, password, confirmPassword, role } = signupData;
    
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

    // Enhanced security validation for signup
    const isSecureAccess = await enhancedSecurityService.validateSecureAccess('teachers', 'INSERT');
    if (!isSecureAccess) {
      toast({
        title: "Security Alert",
        description: "Suspicious activity detected. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Log signup attempt
      await enhancedSecurityService.logSecurityViolation({
        type: 'signup_attempt',
        details: `Teacher signup attempt for email: ${email}, school: ${school}`,
        severity: 'low'
      });

      const result = await teacherLogin(email.trim(), password, name.trim(), school.trim(), role);

      if (result.error) {
        // Log failed signup
        await enhancedSecurityService.logSecurityViolation({
          type: 'signup_failed',
          details: `Failed signup attempt for email: ${email} - ${result.error}`,
          severity: 'medium'
        });

        toast({
          title: t('teacher.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        // Log successful signup
        await enhancedSecurityService.logSecurityViolation({
          type: 'signup_success',
          userId: result.teacher.id,
          details: `Successful teacher signup for email: ${email}, school: ${school}`,
          severity: 'low'
        });

        toast({
          title: t('teacher.accountCreated') || "Account created!",
          description: t('teacher.welcomeToApp') || "Welcome to Lesson Lens!",
        });
        navigate("/teacher-dashboard", { replace: true });
      }
    } catch (err) {
      // Log signup error
      await enhancedSecurityService.logSecurityViolation({
        type: 'signup_error',
        details: `Signup error for email: ${email} - ${err}`,
        severity: 'medium'
      });

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AuthHeader />
      <EnhancedSecurityMonitor />
      
      <div className="w-full max-w-md">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
              <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
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
