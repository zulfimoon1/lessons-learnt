
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, LogInIcon, UserIcon, School, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [simpleLoginData, setSimpleLoginData] = useState({
    fullName: "",
    password: ""
  });

  const [loginData, setLoginData] = useState({
    fullName: "",
    school: "",
    grade: "",
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
  const { studentLogin, studentSimpleLogin, studentSignup } = useAuth();
  const navigate = useNavigate();

  const handleSimpleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Starting student simple login process...');

    try {
      const { error } = await studentSimpleLogin(
        simpleLoginData.fullName,
        simpleLoginData.password
      );

      console.log('Student simple login result:', { error });

      if (error) {
        console.error('Simple login failed:', error);
        toast({
          title: "Login failed",
          description: error,
          variant: "destructive",
        });
      } else {
        console.log('Simple login successful, navigating to dashboard...');
        toast({
          title: "Welcome back! 📚",
          description: "You've successfully logged in.",
        });
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error('Unexpected error during simple login:', err);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Starting student full login process...');

    try {
      const { error } = await studentLogin(
        loginData.fullName,
        loginData.school,
        loginData.grade,
        loginData.password
      );

      console.log('Student full login result:', { error });

      if (error) {
        console.error('Full login failed:', error);
        toast({
          title: "Login failed",
          description: error,
          variant: "destructive",
        });
      } else {
        console.log('Full login successful, navigating to dashboard...');
        toast({
          title: "Welcome! 📚",
          description: "You've successfully logged in.",
        });
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error('Unexpected error during full login:', err);
      toast({
        title: "Login failed",
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
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log('Starting student signup process...');

    try {
      const { error } = await studentSignup(
        signupData.fullName,
        signupData.school,
        signupData.grade,
        signupData.password
      );

      console.log('Student signup result:', { error });

      if (error) {
        console.error('Signup failed:', error);
        toast({
          title: "Signup failed",
          description: error,
          variant: "destructive",
        });
      } else {
        console.log('Signup successful, navigating to dashboard...');
        toast({
          title: "Account created! 🎉",
          description: "Welcome to Lesson Lens!",
        });
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Student Portal</CardTitle>
          <CardDescription>
            Login to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="simple-login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple-login">Quick Login</TabsTrigger>
              <TabsTrigger value="full-login">Full Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="simple-login">
              <form onSubmit={handleSimpleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="simpleFullName" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="simpleFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={simpleLoginData.fullName}
                    onChange={(e) => setSimpleLoginData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simplePassword">Password</Label>
                  <Input
                    id="simplePassword"
                    type="password"
                    placeholder="Enter your password"
                    value={simpleLoginData.password}
                    onChange={(e) => setSimpleLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : (
                    <>
                      <LogInIcon className="w-4 h-4 mr-2" />
                      Quick Login
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  If you have the same name as another student, use "Full Login" instead.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="full-login">
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
                  <Label htmlFor="loginSchool" className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    School
                  </Label>
                  <Input
                    id="loginSchool"
                    type="text"
                    placeholder="Enter your school name"
                    value={loginData.school}
                    onChange={(e) => setLoginData(prev => ({ ...prev, school: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginGrade" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Class/Grade
                  </Label>
                  <Input
                    id="loginGrade"
                    type="text"
                    placeholder="e.g., Grade 5, Class 10A, Year 9"
                    value={loginData.grade}
                    onChange={(e) => setLoginData(prev => ({ ...prev, grade: e.target.value }))}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                    placeholder="e.g., Grade 5, Class 10A, Year 9"
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
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
