
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, LogInIcon, School, UserIcon, Mail, ShieldIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { secureTeacherSignup, secureSignIn } from "@/services/secureAuthService";

const TeacherLogin = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { user, teacher, isLoading: authLoading } = useSupabaseAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && teacher && !authLoading) {
      console.log('TeacherLogin: User already logged in, redirecting...');
      if (teacher.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/teacher-dashboard");
      }
    }
  }, [user, teacher, navigate, authLoading]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    school: "",
    role: "teacher" as "teacher" | "admin" | "doctor",
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
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email.trim() || !loginData.password) {
      toast({
        title: t('teacher.missingInfo'),
        description: `${t('auth.emailRequired')} ${t('auth.passwordRequired')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLogin: Starting login process with email:', loginData.email);

    try {
      const result = await secureSignIn(loginData.email.trim(), loginData.password);
      console.log('TeacherLogin: Login result received:', result);

      if (result.error) {
        console.error('TeacherLogin: Login failed with error:', result.error);
        toast({
          title: t('auth.loginFailed'),
          description: result.error,
          variant: "destructive",
        });
      } else if (result.user) {
        console.log('TeacherLogin: Login successful');
        
        toast({
          title: t('auth.loginSuccess'),
          description: t('auth.loginSuccess'),
        });
        
        // Navigation will be handled by useEffect when auth state updates
      } else {
        console.error('TeacherLogin: No error but no user data returned');
        toast({
          title: t('auth.loginFailed'),
          description: t('auth.loginFailed'),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('TeacherLogin: Unexpected error during login:', err);
      toast({
        title: t('auth.loginFailed'),
        description: t('auth.loginFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name.trim() || !signupData.email.trim() || !signupData.school.trim() || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: t('teacher.missingInfo'),
        description: t('auth.nameRequired') + ', ' + t('auth.emailRequired') + ', ' + t('auth.schoolCodeRequired') + ', ' + t('auth.passwordRequired'),
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('auth.passwordMismatch'),
        description: t('auth.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLogin: Starting signup process for:', signupData.email);

    try {
      const result = await secureTeacherSignup(
        signupData.email.trim(), 
        signupData.password, 
        signupData.name.trim(), 
        signupData.school.trim(), 
        signupData.role
      );

      console.log('TeacherLogin: Signup result received:', result);

      if (result.error) {
        console.error('TeacherLogin: Signup failed with error:', result.error);
        toast({
          title: t('auth.registerError'),
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        console.log('TeacherLogin: Signup successful');
        
        toast({
          title: t('auth.registerSuccess'),
          description: "Please check your email to verify your account before signing in.",
        });
        
        // Reset form and switch to login tab
        setSignupData({
          name: "",
          email: "",
          school: "",
          role: "teacher",
          password: "",
          confirmPassword: ""
        });
      } else {
        console.error('TeacherLogin: No error but no success returned');
        toast({
          title: t('auth.registerError'),
          description: t('auth.registerError'),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('TeacherLogin: Unexpected error during signup:', err);
      toast({
        title: t('auth.registerError'),
        description: t('auth.registerError'),
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
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">{t('auth.password')}</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder={language === 'lt' ? 'Įveskite slaptažodį' : 'Enter your password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.loggingIn') : (
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
                  <Label htmlFor="signupName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {t('auth.fullName')}
                  </Label>
                  <Input
                    id="signupName"
                    type="text"
                    placeholder={language === 'lt' ? 'Įveskite vardą ir pavardę' : 'Enter your full name'}
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
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
                    placeholder={language === 'lt' ? 'Įveskite mokyklos pavadinimą' : 'Enter school name'}
                    value={signupData.school}
                    onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4" />
                    {t('login.teacher.role')}
                  </Label>
                  <Select 
                    value={signupData.role} 
                    onValueChange={(value: "teacher" | "admin" | "doctor") => 
                      setSignupData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'lt' ? 'Pasirinkite vaidmenį' : 'Select role'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">{t('login.teacher.roleTeacher')}</SelectItem>
                      <SelectItem value="admin">{t('login.teacher.roleAdmin')}</SelectItem>
                      <SelectItem value="doctor">
                        {language === 'lt' ? 'Psichinės sveikatos specialistas' : 'Mental Health Professional'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {signupData.role === "admin" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('login.teacher.adminHint')}
                    </p>
                  )}
                  {signupData.role === "doctor" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'lt' 
                        ? 'Psichinės sveikatos specialistai gali prisijungti prie gyvų pokalbių ir studentų gerovės ataskaitų'
                        : 'Mental health professionals can access live chats and student wellbeing reports'
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t('auth.password')}</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder={language === 'lt' ? 'Sukurkite slaptažodį' : 'Create a password'}
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
                    placeholder={language === 'lt' ? 'Patvirtinkite slaptažodį' : 'Confirm your password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
