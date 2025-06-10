
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetAdminPassword, testPasswordVerification } from "@/services/platformAdminService";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginTabProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminLoginTab = ({ 
  email, 
  password, 
  isLoading, 
  onEmailChange, 
  onPasswordChange, 
  onSubmit 
}: AdminLoginTabProps) => {
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await resetAdminPassword(email, 'admin123');
      if (result.error) {
        toast({
          title: "Reset Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset",
          description: "Password has been reset to 'admin123'",
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "An error occurred during password reset",
        variant: "destructive",
      });
    }
  };

  const handlePasswordTest = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await testPasswordVerification(email, password || 'admin123');
      if (result.error) {
        toast({
          title: "Test Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Successful",
          description: result.message || "Password verification test completed",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred during password test",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Admin Login</h2>
        <p className="text-gray-600">Sign in to your admin account</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@yourschool.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Access Console"}
        </Button>
      </form>
      
      <div className="mt-4 pt-4 border-t space-y-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full text-sm" 
          onClick={handlePasswordReset}
          disabled={!email}
        >
          Reset Password to 'admin123'
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          className="w-full text-sm" 
          onClick={handlePasswordTest}
          disabled={!email}
        >
          Test Password Verification
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Development only: These buttons help debug authentication issues
        </p>
      </div>
    </div>
  );
};

export default AdminLoginTab;
