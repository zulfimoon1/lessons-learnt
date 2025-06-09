
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCapIcon, UserIcon, SchoolIcon, BookOpenIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { t } = useLanguage();
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', loginData.fullName.trim())
        .single();

      if (error || !data) {
        toast({
          title: t('student.loginFailed'),
          description: t('student.loginFailed'),
          variant: "destructive",
        });
        return;
      }

      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(loginData.password, data.password_hash);

      if (!isValidPassword) {
        toast({
          title: t('student.loginFailed'),
          description: t('student.loginFailed'),
          variant: "destructive",
        });
        return;
      }

      login(data, 'student');
      
      toast({
        title: t('student.welcomeBack'),
        description: t('student.loginSuccess'),
      });

      navigate('/student-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('student.loginFailed'),
        description: t('student.loginFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: t('student.passwordMismatch'),
        description: t('student.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const bcrypt = await import('bcryptjs');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);

      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            full_name: signupData.fullName.trim(),
            school: signupData.school.trim(),
            grade: signupData.grade.trim(),
            password_hash: hashedPassword
          }
        ])
        .select()
        .single();

      if (error) throw error;

      login(data, 'student');
      
      toast({
        title: t('student.accountCreated'),
        description: t('student.welcomeToApp'),
      });

      navigate('/student-dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('student.signupFailed'),
        description: t('student.signupFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <GraduationCapIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('student.portal')}</h1>
          <p className="text-gray-600">{t('student.loginDescription')}</p>
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                {t('auth.signUp')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <UserIcon className="w-5 h-5" />
                  {t('auth.login')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('student.fullName')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('student.fullNamePlaceholder')}
                      value={loginData.fullName}
                      onChange={(e) => setLoginData({...loginData, fullName: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? t('student.loggingIn') : t('auth.login')}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <BookOpenIcon className="w-5 h-5" />
                  {t('student.createAccount')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupFullName">{t('student.fullName')}</Label>
                    <Input
                      id="signupFullName"
                      type="text"
                      placeholder={t('student.fullNameSignupPlaceholder')}
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">{t('auth.school')}</Label>
                    <Input
                      id="school"
                      type="text"
                      placeholder={t('student.schoolPlaceholder')}
                      value={signupData.school}
                      onChange={(e) => setSignupData({...signupData, school: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">{t('student.classGrade')}</Label>
                    <Input
                      id="grade"
                      type="text"
                      placeholder={t('student.gradePlaceholder')}
                      value={signupData.grade}
                      onChange={(e) => setSignupData({...signupData, grade: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t('student.createPassword')}</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t('student.confirmPasswordPlaceholder')}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? t('student.creatingAccount') : t('student.createAccount')}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;
