
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createCustomAdmin, removePlaceholderAdmin } from "@/services/customAdminCreation";
import { UserPlusIcon, TrashIcon } from "lucide-react";

const CustomAdminCreation = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.school || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCustomAdmin(formData);
      
      if (result.error) {
        toast({
          title: "Creation Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Admin Created Successfully",
          description: `Admin account created for ${formData.email}`,
        });
        
        // Clear form
        setFormData({
          name: "",
          email: "",
          school: "",
          password: ""
        });
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlaceholder = async () => {
    setIsRemoving(true);
    
    try {
      const result = await removePlaceholderAdmin();
      
      if (result.error) {
        toast({
          title: "Removal Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Placeholder Removed",
          description: "Placeholder admin account has been removed",
        });
      }
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlusIcon className="w-5 h-5" />
            Create Custom Admin Account
          </CardTitle>
          <CardDescription>
            Create a new admin account for platform access. This will be a permanent admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Full Name</Label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="Admin Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@yourschool.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-school">School/Organization</Label>
              <Input
                id="admin-school"
                type="text"
                placeholder="Your School Name"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Admin..." : "Create Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrashIcon className="w-5 h-5" />
            Clean Up
          </CardTitle>
          <CardDescription>
            Remove placeholder or test admin accounts that are no longer needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRemovePlaceholder}
            variant="outline"
            disabled={isRemoving}
            className="w-full"
          >
            {isRemoving ? "Removing..." : "Remove Placeholder Admin"}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Setup for zulfimoon1@gmail.com</h3>
        <p className="text-sm text-blue-700 mb-3">
          There's already a database migration prepared to create your admin account. After running the migration, you can log in with:
        </p>
        <div className="bg-white border border-blue-200 rounded p-3 font-mono text-sm">
          <p><strong>Email:</strong> zulfimoon1@gmail.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          You can change your password after first login for security.
        </p>
      </div>
    </div>
  );
};

export default CustomAdminCreation;
