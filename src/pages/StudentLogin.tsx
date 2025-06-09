
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, LogInIcon, UserIcon, School, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { studentSimpleLoginService, studentSignupService } from "@/services/authService";

const StudentLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { student, saveStudent, isLoading: authLoading } = useAuthStorage();

  // Redirect if already logged in - simplified logic
  useEffect(() => {
    console.log('StudentLogin: Checking auth state', { student, authLoading });
    if (student && !authLoading) {
      console.log('StudentLogin: Student already logged in, redirecting...');
      navigate("/student-dashboard", { replace: true });
    }
  }, [student, authLoading, navigate]);

  const [loginData, setLoginData] = useState({
    fullName: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    school: "",
    grade: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  // Don't render if still loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.fullName.trim() || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both your full name and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('StudentLogin: Attempting login for:', loginData.fullName);
      const result = await studentSimpleLoginService(
        loginData.fullName.trim(),
        loginData.password
      );

      if (result.error) {
        console.log('StudentLogin: Login failed with error:', result.error);
        toast({
          title: t('student.loginFailed') || "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Login successful, saving student and redirecting:', result.student);
        saveStudent(result.student);
        toast({
          title: t('student.welcomeBack') || "Welcome back!",
          description: t('student.loginSuccess') || "Login successful",
        });
        // Force immediate redirect
        setTimeout(() => {
          navigate("/student-dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('StudentLogin: Unexpected error during login:', err);
      toast({
        title: t('student.loginFailed') || "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.fullName.trim() || !signupData.school.trim() || !signupData.grade.trim() || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('student.passwordMismatch') || "Password mismatch",
        description: t('student.passwordsDoNotMatch') || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('StudentLogin: Attempting signup for:', signupData.fullName);
      const result = await studentSignupService(
        signupData.fullName.trim(),
        signupData.school.trim(),
        signupData.grade.trim(),
        signupData.password
      );

      if (result.error) {
        console.log('StudentLogin: Signup failed with error:', result.error);
        toast({
          title: t('student.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Signup successful, saving student:', result.student);
        
        // Save the student data immediately
        saveStudent(result.student);
        
        // Show success message
        toast({
          title: t('student.accountCreated') || "Account created!",
          description: "Welcome to Lessons Learnt!",
        });
        
        // Clear the signup form
        setSignupData({
          fullName: "",
          school: "",
          grade: "",
          password: "",
          confirmPassword: ""
        });
        
        console.log('StudentLogin: Redirecting to dashboard after successful signup');
        // Redirect to dashboard immediately after successful signup
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">{t('student.portal') || "Student Portal"}</CardTitle>
          <CardDescription>
            {t('student.loginDescription') || "Access your learning dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login') || "Login"}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp') || "Sign Up"}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginFullName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {t('student.fullName') || "Full Name"}
                  </Label>
                  <Input
                    id="loginFullName"
                    type="text"
                    placeholder={t('student.fullNamePlaceholder') || "Enter your full name"}
                    value={loginData.fullName}
                    onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">{t('auth.password') || "Password"}</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (t('student.loggingIn') || "Logging in...") : (
                    <>
                      <LogInIcon className="w-4 h-4 mr-2" />
                      {t('auth.login') || "Login"}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signupFullName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {t('student.fullName') || "Full Name"}
                  </Label>
                  <Input
                    id="signupFullName"
                    type="text"
                    placeholder={t('student.fullNameSignupPlaceholder') || "Enter your full name"}
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupSchool" className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {t('auth.school') || "School"}
                  </Label>
                  <Input
                    id="signupSchool"
                    type="text"
                    placeholder={t('student.schoolPlaceholder') || "Enter your school name"}
                    value={signupData.school}
                    onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupGrade" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {t('student.classGrade') || "Class/Grade"}
                  </Label>
                  <Input
                    id="signupGrade"
                    type="text"
                    placeholder={t('student.gradePlaceholder') || "e.g., Grade 5, Year 7"}
                    value={signupData.grade}
                    onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t('auth.password') || "Password"}</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder={t('student.createPassword') || "Create a password"}
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword') || "Confirm Password"}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('student.confirmPasswordPlaceholder') || "Confirm your password"}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (t('student.creatingAccount') || "Creating account...") : (t('student.createAccount') || "Create Account")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
