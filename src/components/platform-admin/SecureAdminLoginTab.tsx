
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSecurePlatformAdmin } from "@/contexts/SecurePlatformAdminContext";

interface SecureAdminLoginTabProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SecureAdminLoginTab = ({ 
  email, 
  password, 
  isLoading, 
  onEmailChange, 
  onPasswordChange, 
  onSubmit 
}: SecureAdminLoginTabProps) => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Secure Admin Login</h2>
        <p className="text-gray-600">Sign in with your admin credentials</p>
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
            placeholder="Enter your secure password"
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
          {isLoading ? "Signing In..." : "Access Admin Console"}
        </Button>
      </form>
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 text-center">
          🔒 Secure authentication with Supabase Auth
        </p>
      </div>
    </div>
  );
};

export default SecureAdminLoginTab;
