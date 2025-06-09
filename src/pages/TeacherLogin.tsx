
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpenIcon, UserIcon, GraduationCapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    school: "",
    role: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', loginData.email)
        .single();

      if (profile) {
        login(profile, profile.role === 'admin' ? 'admin' : 'teacher');
        navigate(profile.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('common.error'),
        description: t('common.error'),
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data, error } = await supabase
          .from('teachers')
          .insert([
            {
              id: authData.user.id,
              email: signupData.email,
              full_name: signupData.fullName,
              school: signupData.school,
              role: signupData.role
            }
          ])
          .select()
          .single();

        if (error) throw error;

        login(data, data.role === 'admin' ? 'admin' : 'teacher');
        navigate(data.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('common.error'),
        description: t('common.error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.teacher.title')}</h1>
          <p className="text-gray-600">{t('login.teacher.subtitle')}</p>
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                {t('login.teacher.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                {t('login.teacher.signup')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <UserIcon className="w-5 h-5" />
                  {t('login.teacher.login')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.teacher.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.teacher.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? t('login.teacher.loggingIn') : t('login.teacher.login')}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <GraduationCapIcon className="w-5 h-5" />
                  {t('login.teacher.createAccount')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t('login.teacher.email')}</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupFullName">{t('login.teacher.fullName')}</Label>
                    <Input
                      id="signupFullName"
                      type="text"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupSchool">{t('login.teacher.school')}</Label>
                    <Input
                      id="signupSchool"
                      type="text"
                      value={signupData.school}
                      onChange={(e) => setSignupData({...signupData, school: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">{t('login.teacher.role')}</Label>
                    <Select value={signupData.role} onValueChange={(value) => setSignupData({...signupData, role: value})}>
                      <SelectTrigger className="border-green-200 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">{t('login.teacher.roleTeacher')}</SelectItem>
                        <SelectItem value="admin">{t('login.teacher.roleAdmin')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">{t('login.teacher.adminHint')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t('login.teacher.password')}</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupConfirmPassword">{t('login.teacher.confirmPassword')}</Label>
                    <Input
                      id="signupConfirmPassword"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? t('login.teacher.creatingAccount') : t('login.teacher.createAccount')}
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

export default TeacherLogin;
