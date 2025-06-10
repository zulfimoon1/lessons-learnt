
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { secureTeacherSignup, secureStudentSignup } from "@/services/secureAuthService";
import { UserIcon, GraduationCapIcon, ShieldIcon } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

const SecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { signIn } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  // Teacher signup form state
  const [teacherData, setTeacherData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    school: "",
    role: "teacher" as "teacher" | "admin" | "doctor",
    specialization: "",
    license_number: ""
  });

  // Student signup form state
  const [studentData, setStudentData] = useState({
    password: "",
    confirmPassword: "",
    fullName: "",
    school: "",
    grade: ""
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email || !signInData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      if (result.error) {
        toast({
          title: "Sign In Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teacherData.password !== teacherData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!teacherData.email || !teacherData.password || !teacherData.name || !teacherData.school) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await secureTeacherSignup(
        teacherData.name,
        teacherData.email,
        teacherData.school,
        teacherData.password,
        teacherData.role
      );
      
      if (result.error) {
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your teacher account has been created successfully!",
        });
        setActiveTab("signin");
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentData.password !== studentData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!studentData.fullName || !studentData.password || !studentData.school || !studentData.grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await secureStudentSignup(
        studentData.fullName,
        studentData.school,
        studentData.grade,
        studentData.password
      );
      
      if (result.error) {
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your student account has been created successfully!",
        });
        setActiveTab("signin");
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <CookieConsent />
      <div className="flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldIcon className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Secure Authentication</CardTitle>
            <CardDescription>
              Sign in or create your secure account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="teacher" className="space-y-4">
                <form onSubmit={handleTeacherSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email *</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="teacher@school.edu"
                      value={teacherData.email}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Full Name *</Label>
                    <Input
                      id="teacher-name"
                      type="text"
                      placeholder="Your full name"
                      value={teacherData.name}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-school">School *</Label>
                    <Input
                      id="teacher-school"
                      type="text"
                      placeholder="School name"
                      value={teacherData.school}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, school: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-role">Role</Label>
                    <Select
                      value={teacherData.role}
                      onValueChange={(value: "teacher" | "admin" | "doctor") => 
                        setTeacherData(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="doctor">Mental Health Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password *</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      value={teacherData.password}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-confirm">Confirm Password *</Label>
                    <Input
                      id="teacher-confirm"
                      type="password"
                      value={teacherData.confirmPassword}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <GraduationCapIcon className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating Account..." : "Create Teacher Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student" className="space-y-4">
                <form onSubmit={handleStudentSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name *</Label>
                    <Input
                      id="student-name"
                      type="text"
                      placeholder="Your full name"
                      value={studentData.fullName}
                      onChange={(e) => setStudentData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-school">School *</Label>
                    <Input
                      id="student-school"
                      type="text"
                      placeholder="School name"
                      value={studentData.school}
                      onChange={(e) => setStudentData(prev => ({ ...prev, school: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-grade">Grade/Class *</Label>
                    <Input
                      id="student-grade"
                      type="text"
                      placeholder="e.g., 5th Grade, 10A, Year 9"
                      value={studentData.grade}
                      onChange={(e) => setStudentData(prev => ({ ...prev, grade: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password *</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentData.password}
                      onChange={(e) => setStudentData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-confirm">Confirm Password *</Label>
                    <Input
                      id="student-confirm"
                      type="password"
                      value={studentData.confirmPassword}
                      onChange={(e) => setStudentData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating Account..." : "Create Student Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default SecureAuth;
