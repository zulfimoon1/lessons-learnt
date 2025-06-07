
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, LogInIcon, UserIcon, School, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const StudentLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Safe auth hook usage with error boundary
  let auth;
  try {
    auth = useAuth();
    console.log('StudentLogin: Auth context loaded successfully');
  } catch (error) {
    console.error('StudentLogin: Auth context error:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-muted-foreground">Unable to access authentication. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const { student, studentLogin, studentSignup, isLoading: authLoading } = auth;

  // Redirect if already logged in
  useEffect(() => {
    console.log('StudentLogin: Checking auth state - student:', student, 'authLoading:', authLoading);
    if (student && !authLoading) {
      console.log('StudentLogin: Student already logged in, redirecting...');
      navigate("/student-dashboard");
    }
  }, [student, navigate, authLoading]);

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
    console.log('StudentLogin: Auth still loading...');
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
    console.log('StudentLogin: Login attempt started for:', loginData.fullName);
    
    if (!loginData.fullName.trim() || !loginData.password) {
      console.log('StudentLogin: Missing login data');
      toast({
        title: "Missing information",
        description: "Please enter both your full name and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('StudentLogin: Calling studentLogin service...');

    try {
      const result = await studentLogin(
        loginData.fullName.trim(),
        loginData.password
      );

      console.log('StudentLogin: Login result received:', result);

      if (result.error) {
        console.error('StudentLogin: Login failed with error:', result.error);
        toast({
          title: t('student.loginFailed') || "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Login successful for student:', result.student);
        toast({
          title: t('student.welcomeBack') || "Welcome back!",
          description: t('student.loginSuccess') || "Login successful",
        });
        // Navigation should be handled by useEffect when student state updates
      } else {
        console.error('StudentLogin: No error but no student data returned');
        toast({
          title: t('student.loginFailed') || "Login failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
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
    console.log('StudentLogin: Signup attempt started for:', signupData.fullName);
    
    if (!signupData.fullName.trim() || !signupData.school.trim() || !signupData.grade.trim() || !signupData.password || !signupData.confirmPassword) {
      console.log('StudentLogin: Missing signup data');
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      console.log('StudentLogin: Password mismatch');
      toast({
        title: t('student.passwordMismatch') || "Password mismatch",
        description: t('student.passwordsDoNotMatch') || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('StudentLogin: Calling studentSignup service...');

    try {
      const result = await studentSignup(
        signupData.fullName.trim(),
        signupData.school.trim(),
        signupData.grade.trim(),
        signupData.password
      );

      console.log('StudentLogin: Signup result received:', result);

      if (result.error) {
        console.error('StudentLogin: Signup failed with error:', result.error);
        toast({
          title: t('student.signupFailed') || "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('StudentLogin: Signup successful for student:', result.student);
        toast({
          title: t('student.accountCreated') || "Account created!",
          description: t('student.welcomeToApp') || "Welcome to Lesson Lens!",
        });
        // Navigation should be handled by useEffect when student state updates
      } else {
        console.error('StudentLogin: No error but no student data returned');
        toast({
          title: t('student.signupFailed') || "Signup failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
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

  console.log('StudentLogin: Rendering login page');

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
          <CardTitle className="text-2xl text-foreground">Student Portal</CardTitle>
          <CardDescription>
            Access your learning dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginFullName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="loginFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={loginData.fullName}
                    onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
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
                  {isLoading ? "Logging in..." : (
                    <>
                      <LogInIcon className="w-4 h-4 mr-2" />
                      Login
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
                    Full Name
                  </Label>
                  <Input
                    id="signupFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupSchool" className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    School
                  </Label>
                  <Input
                    id="signupSchool"
                    type="text"
                    placeholder="Enter your school name"
                    value={signupData.school}
                    onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupGrade" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Class/Grade
                  </Label>
                  <Input
                    id="signupGrade"
                    type="text"
                    placeholder="e.g., Grade 5, Year 7"
                    value={signupData.grade}
                    onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
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
                  {isLoading ? "Creating account..." : "Create Account"}
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
