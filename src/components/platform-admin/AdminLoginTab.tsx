
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
      console.log('🔄 Starting password reset for:', email);
      const result = await resetAdminPassword(email, 'admin123');
      console.log('🔄 Password reset result:', result);
      
      if (!result.success) {
        toast({
          title: "Reset Failed", 
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Password Reset Successful",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: "An error occurred during password reset",
        variant: "destructive",
      });
    }
  };

  const handlePasswordTest = async () => {
    console.log('🔍 === TEST PASSWORD BUTTON CLICKED ===');
    
    if (!email) {
      console.log('❌ No email provided');
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    const testPassword = password || 'admin123';
    console.log('🔍 Testing with email:', email);
    console.log('🔍 Testing with password:', testPassword);

    toast({
      title: "🔍 Testing Connection",
      description: "Verifying admin account access...",
    });

    try {
      console.log('🔍 Calling testPasswordVerification...');
      const result = await testPasswordVerification(email, testPassword);
      console.log('🔍 Test password verification result:', result);
      
      if (result.error) {
        console.error('❌ Test failed with error:', result.error);
        toast({
          title: "❌ Connection Test Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        console.log('✅ Test successful!');
        toast({
          title: "✅ Connection Test Successful",
          description: result.message || "Admin account is accessible and ready for login",
        });
      } else {
        console.log('⚠️ Unexpected result format:', result);
        toast({
          title: "⚠️ Test Completed",
          description: result.message || "Connection test completed with unknown status",
        });
      }
    } catch (error) {
      console.error('💥 Test password error:', error);
      toast({
        title: "💥 Connection Test Failed",
        description: `Network error occurred: ${error.message}`,
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
            placeholder="Enter password (default: admin123)"
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
          🔄 Reset Password to 'admin123'
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          className="w-full text-sm" 
          onClick={handlePasswordTest}
          disabled={!email}
        >
          🔍 Test Connection
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Use these tools if you're having trouble logging in
        </p>
      </div>
    </div>
  );
};

export default AdminLoginTab;
