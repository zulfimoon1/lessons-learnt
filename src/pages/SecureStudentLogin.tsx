
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
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { z } from "zod";

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  school: z.string().min(2, "School name must be at least 2 characters"),
  grade: z.string().min(1, "Grade is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SecureStudentLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signIn, signUp, isLoading: authLoading } = useSecureAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile && !authLoading) {
      console.log('SecureStudentLogin: Student already logged in, redirecting...');
      navigate("/student-dashboard", { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    school: "",
    grade: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
    
    try {
      const validatedData = loginSchema.parse(loginData);
      setIsLoading(true);

      console.log('SecureStudentLogin: Attempting secure login');
      const result = await signIn(validatedData.email, validatedData.password);

      if (result.error) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Login failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = signupSchema.parse(signupData);
      setIsLoading(true);

      console.log('SecureStudentLogin: Attempting secure signup');
      const result = await signUp(validatedData.email, validatedData.password, {
        user_type: 'student',
        full_name: validatedData.fullName,
        school: validatedData.school,
        grade: validatedData.grade,
      });

      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Signup failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
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
          <CardTitle className="text-2xl text-foreground">Secure Student Portal</CardTitle>
          <CardDescription>
            Access your learning dashboard securely
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
                  <Label htmlFor="loginEmail" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
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
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
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
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
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
                  {errors.school && <p className="text-sm text-red-600">{errors.school}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupGrade" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Grade
                  </Label>
                  <Input
                    id="signupGrade"
                    type="text"
                    placeholder="e.g., Grade 5, Year 7"
                    value={signupData.grade}
                    onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
                    required
                  />
                  {errors.grade && <p className="text-sm text-red-600">{errors.grade}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a strong password (min 8 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
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
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
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

export default SecureStudentLogin;
