
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { createTestAdmin } from "@/services/platformAdminService";
import { ShieldIcon, UserPlusIcon } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

const PlatformAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { login } = usePlatformAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting login form');
      const result = await login(email, password);
      
      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to the platform admin dashboard",
        });
        navigate("/platform-admin");
      }
    } catch (error) {
      console.error('Login form error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestAdmin = async () => {
    setIsCreatingAdmin(true);
    
    try {
      const result = await createTestAdmin();
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Admin Created",
          description: "Email: admin@test.com, Password: admin123",
        });
        setEmail("admin@test.com");
        setPassword("admin123");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test admin",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
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
            <CardTitle className="text-2xl font-bold">Platform Admin</CardTitle>
            <CardDescription>
              Sign in to access the platform management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleCreateTestAdmin}
                disabled={isCreatingAdmin}
                className="w-full"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                {isCreatingAdmin ? "Creating..." : "Create Test Admin"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This will create admin@test.com with password admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default PlatformAdminLogin;
