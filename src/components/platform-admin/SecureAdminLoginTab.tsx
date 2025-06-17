
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecureAdminLoginTabProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const SecureAdminLoginTab = ({ onLogin, isLoading }: SecureAdminLoginTabProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const validateInput = (input: string) => {
    // Enhanced input validation with XSS protection
    const dangerous = /<script|javascript:|on\w+=/i;
    return !dangerous.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security checks
    if (!validateInput(email) || !validateInput(password)) {
      toast({
        title: "Security Alert",
        description: "Invalid characters detected in input",
        variant: "destructive"
      });
      return;
    }

    if (isBlocked) {
      toast({
        title: "Access Blocked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive"
      });
      return;
    }

    if (!email.trim() || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      await onLogin(email.trim(), password);
      setLoginAttempts(0);
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 900000); // 15 minutes
        toast({
          title: "Security Alert",
          description: "Account temporarily locked due to multiple failed attempts",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Secure Admin Access</CardTitle>
        <CardDescription>
          Platform administrator authentication required
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginAttempts > 2 && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {5 - loginAttempts} attempts remaining before temporary lockout
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Administrator Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@lessonlens.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isBlocked}
              className="focus:ring-2 focus:ring-red-500"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Secure Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isBlocked}
                className="focus:ring-2 focus:ring-red-500 pr-10"
                required
                autoComplete="current-password"
                minLength={12}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700" 
            disabled={isLoading || isBlocked}
          >
            {isLoading ? "Authenticating..." : "Secure Login"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Forgot password? Contact system administrator.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureAdminLoginTab;
