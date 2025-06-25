
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCapIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import TeacherLoginForm from "@/components/auth/TeacherLoginForm";
import TeacherSignupForm from "@/components/auth/TeacherSignupForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const TeacherLogin = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, isLoading: authLoading, teacherLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get proper translations with fallbacks
  const getTitle = () => {
    if (language === 'lt') return 'Mokytojų portalas';
    return t('login.teacher.title') || 'Teacher Portal';
  };

  const getSubtitle = () => {
    if (language === 'lt') return 'Prisijunkite prie savo mokymo skydelio';
    return t('login.teacher.subtitle') || 'Log in to your teaching dashboard';
  };

  const getLoginText = () => {
    if (language === 'lt') return 'Prisijungti';
    return t('auth.login') || 'Login';
  };

  const getSignUpText = () => {
    if (language === 'lt') return 'Registruotis';
    return t('auth.signUp') || 'Sign Up';
  };

  // Redirect if already logged in
  useEffect(() => {
    if (teacher && !authLoading) {
      console.log('Teacher already logged in, redirecting to dashboard');
      navigate("/teacher-dashboard", { replace: true });
    }
  }, [teacher, authLoading, navigate]);

  // Don't render if still loading auth state
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

  const handleLogin = async (email: string, password: string) => {
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
      console.log('TeacherLogin: Attempting login for:', email);
      const result = await teacherLogin(email, password);

      if (result.error) {
        console.log('TeacherLogin: Login failed with error:', result.error);
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        console.log('TeacherLogin: Login successful, navigating to dashboard');
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        setTimeout(() => {
          navigate("/teacher-dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('TeacherLogin: Login error:', err);
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
      const { signupTeacher } = await import('@/services/authIntegrationService');
      const result = await signupTeacher(name, email, school, password, role);

      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        const { setTeacher } = useAuth();
        setTeacher(result.teacher);
        localStorage.setItem('teacher', JSON.stringify(result.teacher));
        
        toast({
          title: "Account created!",
          description: "Welcome to Lesson Lens!",
        });
        navigate("/teacher-dashboard", { replace: true });
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
    <div className="min-h-screen bg-brand-gradient-soft">
      {/* Header similar to dashboard */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm border-brand-teal/30 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-gradient rounded-full mx-auto flex items-center justify-center">
                <GraduationCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-brand-dark">{getTitle()}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {getSubtitle()}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="login" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white text-brand-dark">{getLoginText()}</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white text-brand-dark">{getSignUpText()}</TabsTrigger>
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
      </div>
    </div>
  );
};

export default TeacherLogin;
