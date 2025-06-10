
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlusIcon } from "lucide-react";
import { createTestAdmin } from "@/services/platformAdminService";
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
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { toast } = useToast();

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
        onEmailChange("admin@test.com");
        onPasswordChange("admin123");
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
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">Admin Login</h2>
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
      
      <div className="text-center pt-4 border-t">
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
          Development only: Creates admin@test.com with password admin123
        </p>
      </div>
    </div>
  );
};

export default AdminLoginTab;
