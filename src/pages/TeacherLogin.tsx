
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCapIcon, LogInIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeacherLoginProps {
  onLogin: (teacherData: { name: string; email: string }) => void;
}

const TeacherLogin = ({ onLogin }: TeacherLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple demo authentication - in real app, this would be proper auth
    if (email.includes("@") && password.length > 0) {
      setTimeout(() => {
        onLogin({
          name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
          email: email
        });
        toast({
          title: "Welcome back! 👨‍🏫",
          description: "You've successfully logged in to your teacher dashboard.",
        });
        setIsLoading(false);
      }, 1000);
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please enter a valid email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <GraduationCapIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Teacher Login</CardTitle>
          <CardDescription>
            Access your dashboard to review student feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <div className="mt-4 text-center text-sm text-gray-600">
            Demo: Use any email and password to login
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
