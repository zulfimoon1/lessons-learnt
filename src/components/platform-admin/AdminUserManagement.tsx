
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { validatePasswordStrength } from '@/services/securePasswordService';

const AdminUserManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingAdminError, setExistingAdminError] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, score: 0, feedback: [] });
  const { toast } = useToast();

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(validatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent, allowUpdate = false) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (!passwordStrength.isValid) {
      toast({
        title: "Error",
        description: "Password does not meet security requirements",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExistingAdminError(null);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('create-platform-admin', {
        body: {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          adminEmail: 'zulfimoon1@gmail.com',
          allowUpdate
        }
      });

      if (error) {
        console.error('Platform admin creation error:', error);
        toast({
          title: "❌ Creation Failed",
          description: 'Failed to create platform admin account',
          variant: "destructive",
        });
        return;
      }

      if (!data || !data.success) {
        if (data?.error?.includes('already exists') && data.existing_admin) {
          setExistingAdminError(data);
          return;
        }
        
        toast({
          title: "❌ Creation Failed",
          description: data?.error || 'Failed to create platform admin account',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: allowUpdate ? "✅ Admin Updated" : "✅ Admin Created",
        description: `Platform admin account ${allowUpdate ? 'updated' : 'created'} for ${formData.email}`,
        variant: "default",
      });
      
      // Reset form and error state
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      setPasswordStrength({ isValid: false, score: 0, feedback: [] });
      setExistingAdminError(null);
    } catch (error: any) {
      console.error('Platform admin creation error:', error);
      toast({
        title: "❌ Error",
        description: 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Medium';
    return 'Weak';
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add Platform Admin User
        </CardTitle>
        <p className="text-sm text-gray-600">
          Create a new platform admin account with full administrative privileges
        </p>
      </CardHeader>
      <CardContent>
        {existingAdminError && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <p><strong>Admin Already Exists:</strong> {existingAdminError.existing_admin?.email}</p>
                <p><strong>Current Name:</strong> {existingAdminError.existing_admin?.name}</p>
                <p className="text-sm">{existingAdminError.suggestion}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Update Existing Admin
                  </Button>
                  <Button
                    onClick={() => {
                      setExistingAdminError(null);
                      setFormData({ name: '', email: '', password: '' });
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Use Different Email
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Full Name</Label>
            <Input
              id="admin-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Address</Label>
            <Input
              id="admin-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter secure password (min 12 characters)"
                required
                disabled={isLoading}
                minLength={12}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {formData.password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Strength:</span>
                  <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                    {getStrengthLabel(passwordStrength.score)} ({passwordStrength.score}%)
                  </span>
                  {passwordStrength.isValid ? (
                    <Shield className="w-4 h-4 text-green-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 80 ? 'bg-green-600' :
                      passwordStrength.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <ul className="text-sm space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-current rounded-full"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !passwordStrength.isValid} 
            className="w-full"
          >
            {isLoading ? 'Creating Admin Account...' : 'Create Platform Admin'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Notice:
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• New admin will have full platform access</li>
            <li>• Admin can create/delete schools and users</li>
            <li>• Admin can access all financial data</li>
            <li>• Use strong, unique passwords only</li>
            <li>• Only create accounts for trusted individuals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
