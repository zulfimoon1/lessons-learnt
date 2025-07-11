
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import StudentLoginForm from "@/components/auth/StudentLoginForm";
import StudentSignupForm from "@/components/auth/StudentSignupForm";
import LoginVerificationTester from "@/components/LoginVerificationTester";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const StudentLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { student, isLoading: authLoading, studentLogin, studentSignup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showTester, setShowTester] = useState(false);

  // Always call useEffect hooks in the same order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setShowTester(!showTester);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTester]);

  // Redirect if already logged in - moved after all hook calls
  useEffect(() => {
    console.log('StudentLogin: Checking auth state', { student, authLoading });
    if (student && !authLoading) {
      console.log('StudentLogin: Student already logged in, redirecting...');
      navigate("/student-dashboard", { replace: true });
    }
  }, [student, authLoading, navigate]);

  // Don't render if still loading auth state
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

  const handleLogin = async (fullName: string, password: string) => {
    console.log('StudentLogin: Login attempt with:', { fullName });
    
    if (!fullName.trim() || !password) {
      toast({
        title: "Missing information",
        description: "Please enter your full name and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('StudentLogin: Attempting login with credentials:', { fullName });
      
      // Login with just name and password
      const result = await studentLogin(fullName.trim(), password);

      if (result.error) {
        console.log('StudentLogin: Login failed with error:', result.error);
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Login successful, redirecting to dashboard');
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('StudentLogin: Unexpected error during login:', err);
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
      console.log('StudentLogin: Attempting signup for:', fullName);
      
      const result = await studentSignup(fullName.trim(), school.trim(), grade.trim(), password);

      if (result.error) {
        console.log('StudentLogin: Signup failed with error:', result.error);
        toast({
          title: t('student.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Signup successful, redirecting to dashboard');
        toast({
          title: t('student.accountCreated') || "Account created!",
          description: t('student.welcomeToApp') || "Welcome to Lesson Lens!",
        });
        navigate("/student-dashboard", { replace: true });
      }
    } catch (err) {
      console.error('StudentLogin: Unexpected error during signup:', err);
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
        {showTester ? (
          <div className="w-full max-w-6xl">
            <LoginVerificationTester />
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowTester(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Hide Login Tester (Ctrl+Shift+T)
              </button>
            </div>
          </div>
        ) : (
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-brand-teal/30 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-gradient rounded-full mx-auto flex items-center justify-center">
                <BookOpenIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-brand-dark">{t('login.student.title')}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {t('login.student.subtitle')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="login" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white text-brand-dark">{t('auth.login')}</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white text-brand-dark">{t('auth.signUp')}</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <StudentLoginForm onLogin={handleLogin} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="signup">
                  <StudentSignupForm onSignup={handleSignup} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowTester(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Press Ctrl+Shift+T for login verification
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentLogin;
