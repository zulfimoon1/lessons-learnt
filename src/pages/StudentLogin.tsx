
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenIcon, LogInIcon, UserIcon, School, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentLoginProps {
  onLogin: (studentData: { name: string; email: string; school: string; grade: string }) => void;
  onContinueAnonymous: () => void;
}

const StudentLogin = ({ onLogin, onContinueAnonymous }: StudentLoginProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    school: "",
    grade: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple demo authentication - in real app, this would be proper auth
    if (formData.email.includes("@") && formData.password.length > 0 && formData.fullName && formData.school && formData.grade) {
      setTimeout(() => {
        onLogin({
          name: formData.fullName,
          email: formData.email,
          school: formData.school,
          grade: formData.grade
        });
        toast({
          title: "Welcome! 📚",
          description: "You've successfully logged in.",
        });
        setIsLoading(false);
      }, 1000);
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to continue.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAnonymousReview = () => {
    toast({
      title: "Anonymous Mode 🔒",
      description: "Your feedback will be completely anonymous.",
    });
    onContinueAnonymous();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Student Login</CardTitle>
          <CardDescription>
            Enter your details to give feedback or continue anonymously
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center gap-2">
                <School className="w-4 h-4" />
                School
              </Label>
              <Input
                id="school"
                type="text"
                placeholder="Enter your school name"
                value={formData.school}
                onChange={(e) => handleInputChange("school", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Class/Grade
              </Label>
              <Input
                id="grade"
                type="text"
                placeholder="e.g., Grade 5, Class 10A, Year 9"
                value={formData.grade}
                onChange={(e) => handleInputChange("grade", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@school.edu"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                "Logging in..."
              ) : (
                <>
                  <LogInIcon className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={handleAnonymousReview}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Continue Anonymously
          </Button>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p className="mb-2">Demo: Fill in all fields to login</p>
            <p className="text-orange-600">
              Feel scared to share? Use anonymous mode for complete privacy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
