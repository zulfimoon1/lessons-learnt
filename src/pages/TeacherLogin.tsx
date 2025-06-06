
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCapIcon, LogInIcon, School, UserIcon, Mail, ShieldIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const TeacherLogin = () => {
  const { t } = useLanguage();
  const { teacher } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (teacher) {
      console.log('TeacherLogin: User already logged in, redirecting...');
      if (teacher.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/teacher-dashboard");
      }
    }
  }, [teacher, navigate]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    school: "",
    role: "teacher" as "teacher" | "admin",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { teacherLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLogin: Starting login process with email:', loginData.email);

    try {
      const result = await teacherLogin(loginData.email, loginData.password);
      console.log('TeacherLogin: Login result received:', result);

      if (result.error) {
        console.error('TeacherLogin: Login failed with error:', result.error);
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        console.log('TeacherLogin: Login successful, teacher data:', result.teacher);
        
        toast({
          title: "Welcome back! 👨‍🏫",
          description: `Successfully logged in as ${result.teacher.name}`,
        });
        
        // Navigation will be handled by useEffect when teacher state updates
        console.log('TeacherLogin: Teacher role is:', result.teacher.role);
      } else {
        console.error('TeacherLogin: No error but no teacher data returned');
        toast({
          title: "Login failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('TeacherLogin: Unexpected error during login:', err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name || !signupData.email || !signupData.school || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLogin: Starting signup process for:', signupData.email);

    try {
      const result = await teacherLogin(
        signupData.email, 
        signupData.password, 
        signupData.name, 
        signupData.school, 
        signupData.role
      );

      console.log('TeacherLogin: Signup result received:', result);

      if (result.error) {
        console.error('TeacherLogin: Signup failed with error:', result.error);
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.teacher) {
        console.log('TeacherLogin: Signup successful, teacher data:', result.teacher);
        
        toast({
          title: "Account created! 🎉",
          description: `Welcome to Lesson Lens, ${result.teacher.name}!`,
        });
        
        // Navigation will be handled by useEffect when teacher state updates
        console.log('TeacherLogin: New teacher role is:', result.teacher.role);
      } else {
        console.error('TeacherLogin: No error but no teacher data returned');
        toast({
          title: "Signup failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('TeacherLogin: Unexpected error during signup:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <GraduationCapIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">{t('login.teacher.title')}</CardTitle>
          <CardDescription>
            {t('login.teacher.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('login.teacher.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('login.teacher.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('login.teacher.email')}
                  </Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="teacher@school.edu"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">{t('login.teacher.password')}</Label>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('login.teacher.loggingIn') : (
                    <>
                      <LogInIcon className="w-4 h-4 mr-2" />
                      {t('login.teacher.login')}
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
                    {t('login.teacher.fullName')}
                  </Label>
                  <Input
                    id="signupName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('login.teacher.email')}
                  </Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="teacher@school.edu"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupSchool" className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {t('login.teacher.school')}
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
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4" />
                    {t('login.teacher.role') || "Role"}
                  </Label>
                  <Select 
                    value={signupData.role} 
                    onValueChange={(value: "teacher" | "admin") => 
                      setSignupData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">{t('login.teacher.roleTeacher') || "Teacher"}</SelectItem>
                      <SelectItem value="admin">{t('login.teacher.roleAdmin') || "School Admin"}</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupData.role === "admin" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('login.teacher.adminHint') || "School Admins can manage teachers and view all feedback"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t('login.teacher.password')}</Label>
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
                  <Label htmlFor="confirmPassword">{t('login.teacher.confirmPassword')}</Label>
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
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('login.teacher.creatingAccount') : t('login.teacher.createAccount')}
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
