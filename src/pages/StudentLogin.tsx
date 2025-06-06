
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
  const { studentSimpleLogin, studentSignup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Starting student login process...');

    try {
      const { error } = await studentSimpleLogin(
        loginData.fullName,
        loginData.password
      );

      console.log('Student login result:', { error });

      if (error) {
        console.error('Login failed:', error);
        toast({
          title: "Login failed",
          description: error,
          variant: "destructive",
        });
      } else {
        console.log('Login successful, navigating to dashboard...');
        toast({
          title: "Welcome back! 📚",
          description: "You've successfully logged in.",
        });
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
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
