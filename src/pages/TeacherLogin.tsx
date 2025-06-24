
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCapIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSafeLanguage } from "@/contexts/SafeLanguageContext";
import { useSafeAuth } from "@/contexts/SafeAuthContext";
import AuthHeader from "@/components/auth/AuthHeader";
import TeacherLoginForm from "@/components/auth/TeacherLoginForm";
import TeacherSignupForm from "@/components/auth/TeacherSignupForm";

const TeacherLogin = () => {
  const { t, language } = useSafeLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teacher, isLoading: authLoading, teacherLogin } = useSafeAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔍 TeacherLogin: Current state', { teacher, authLoading });

  // Get proper translations with fallbacks
  const getTitle = () => {
    if (language === 'lt') return 'Mokytojų portalas';
    return 'Teacher Portal';
  };

  const getSubtitle = () => {
    if (language === 'lt') return 'Prisijunkite prie savo mokymo skydelio';
    return 'Log in to your teaching dashboard';
  };

  const getLoginText = () => {
    if (language === 'lt') return 'Prisijungti';
    return 'Login';
  };

  const getSignUpText = () => {
    if (language === 'lt') return 'Registruotis';
    return 'Sign Up';
  };

  // Redirect if already logged in
  useEffect(() => {
    if (teacher && !authLoading) {
      console.log('✅ Teacher already logged in, redirecting to dashboard');
      navigate("/teacher-dashboard", { replace: true });
    }
  }, [teacher, authLoading, navigate]);

  // Don't render if still loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-2 text-brand-dark">Loading...</p>
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
      console.log('🔐 TeacherLogin: Attempting login for:', email);
      const result = await teacherLogin(email, password);

      if (result.error) {
        console.log('❌ TeacherLogin: Login failed with error:', result.error);
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        console.log('✅ TeacherLogin: Login successful, navigating to dashboard');
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        setTimeout(() => {
          navigate("/teacher-dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('💥 TeacherLogin: Login error:', err);
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
      console.log('🔐 TeacherLogin: Attempting signup for:', email);
      // Import signup function dynamically to avoid circular imports
      const { signupTeacher } = await import('@/services/authIntegrationService');
      const validRole = role as 'teacher' | 'admin' | 'doctor';
      const result = await signupTeacher(name, email, school, password, validRole);

      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        // Use safe auth to set teacher
        const loginResult = await teacherLogin(email, password);
        if (loginResult.teacher) {
          toast({
            title: "Account created!",
            description: "Welcome to Lesson Lens!",
          });
          navigate("/teacher-dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error('💥 TeacherLogin: Signup error:', err);
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
        <Card className="bg-white/95 backdrop-blur-sm border-brand-teal/30 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-brand-teal rounded-full mx-auto flex items-center justify-center mb-4">
              <GraduationCapIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-brand-dark">{getTitle()}</CardTitle>
            <CardDescription className="text-gray-600">
              {getSubtitle()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{getLoginText()}</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{getSignUpText()}</TabsTrigger>
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
  );
};

export default TeacherLogin;
