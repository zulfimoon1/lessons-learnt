
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

const StudentLogin = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect if already logged in
  useEffect(() => {
    if (student) {
      console.log('StudentLogin: Student already logged in, redirecting...');
      navigate("/student-dashboard");
    }
  }, [student, navigate]);

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
  const { toast } = useToast();
  const { studentLogin, studentSignup } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Starting student login process with data:', { 
      fullName: loginData.fullName, 
      passwordLength: loginData.password.length 
    });

    try {
      const result = await studentLogin(
        loginData.fullName.trim(),
        loginData.password
      );

      console.log('Student login result:', result);

      if (result.error) {
        console.error('Login failed:', result.error);
        toast({
          title: t('student.loginFailed'),
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('Login successful, student data:', result.student);
        toast({
          title: t('student.welcomeBack'),
          description: t('student.loginSuccess'),
        });
        // Navigation will be handled by useEffect when student state updates
      } else {
        toast({
          title: t('student.loginFailed'),
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      toast({
        title: t('student.loginFailed'),
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('student.passwordMismatch'),
        description: t('student.passwordsDoNotMatch'),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log('Starting student signup process...');

    try {
      const result = await studentSignup(
        signupData.fullName.trim(),
        signupData.school.trim(),
        signupData.grade.trim(),
        signupData.password
      );

      console.log('Student signup result:', result);

      if (result.error) {
        console.error('Signup failed:', result.error);
        toast({
          title: t('student.signupFailed'),
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('Signup successful, student data:', result.student);
        toast({
          title: t('student.accountCreated'),
          description: t('student.welcomeToApp'),
        });
        // Navigation will be handled by useEffect when student state updates
      } else {
        toast({
          title: t('student.signupFailed'),
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      toast({
        title: t('student.signupFailed'),
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">{t('student.portal')}</CardTitle>
          <CardDescription>
            {t('student.loginDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginFullName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {t('student.fullName')}
                  </Label>
                  <Input
                    id="loginFullName"
                    type="text"
                    placeholder={t('student.fullNamePlaceholder')}
                    value={loginData.fullName}
                    onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">{t('auth.password')}</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder={t('auth.password')}
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
                  {isLoading ? t('student.loggingIn') : (
                    <>
                      <LogInIcon className="w-4 h-4 mr-2" />
                      {t('auth.login')}
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
                    {t('student.fullName')}
                  </Label>
                  <Input
                    id="signupFullName"
                    type="text"
                    placeholder={t('student.fullNameSignupPlaceholder')}
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupSchool" className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {t('auth.school')}
                  </Label>
                  <Input
                    id="signupSchool"
                    type="text"
                    placeholder={t('student.schoolPlaceholder')}
                    value={signupData.school}
                    onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupGrade" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {t('student.classGrade')}
                  </Label>
                  <Input
                    id="signupGrade"
                    type="text"
                    placeholder={t('student.gradePlaceholder')}
                    value={signupData.grade}
                    onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t('auth.password')}</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder={t('student.createPassword')}
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('student.confirmPasswordPlaceholder')}
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
                  {isLoading ? t('student.creatingAccount') : t('student.createAccount')}
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
