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

const StudentLogin = () => {
  const { student } = useAuth();
  const navigate = useNavigate();

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
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('Login successful, student data:', result.student);
        toast({
          title: "Welcome back! 📚",
          description: "You've successfully logged in.",
        });
        // Navigation will be handled by useEffect when student state updates
      } else {
        toast({
          title: "Login failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
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
          title: "Signup failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.student) {
        console.log('Signup successful, student data:', result.student);
        toast({
          title: "Account created! 🎉",
          description: "Welcome to Lesson Lens!",
        });
        // Navigation will be handled by useEffect when student state updates
      } else {
        toast({
          title: "Signup failed",
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">Student Portal</CardTitle>
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
                    placeholder="Enter your full name exactly as registered"
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
