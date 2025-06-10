
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCustomAdmin, removePlaceholderAdmin } from "@/services/customAdminCreation";
import { UserPlusIcon, ShieldIcon } from "lucide-react";

const CustomAdminCreation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.school || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First remove the placeholder admin
      await removePlaceholderAdmin();
      
      // Create the custom admin
      const result = await createCustomAdmin(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Admin Created Successfully",
          description: `Admin account created for ${formData.email}. You can now log in with these credentials.`,
        });
        
        // Clear the form
        setFormData({
          name: '',
          email: '',
          school: '',
          password: ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldIcon className="w-12 h-12 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-bold">Create Your Admin Account</CardTitle>
        <CardDescription>
          Set up your personal platform administrator account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@yourschool.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="school">School Name</Label>
            <Input
              id="school"
              type="text"
              placeholder="Your School Name"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a secure password"
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
            <UserPlusIcon className="w-4 h-4 mr-2" />
            {isLoading ? "Creating Admin..." : "Create Admin Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomAdminCreation;
