
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securePlatformAdminService } from '@/services/securePlatformAdminService';
import { validatePasswordStrength } from '@/services/securePasswordService';
import { Lock, Eye, EyeOff, Shield, CheckCircle, XCircle } from 'lucide-react';

const PasswordChangeForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, score: 0, feedback: [] });
  const { toast } = useToast();
  const { admin } = usePlatformAdmin();

  const handleNewPasswordChange = (password: string) => {
    setFormData({ ...formData, newPassword: password });
    setPasswordStrength(validatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admin?.email) {
      toast({
        title: "Error",
        description: "No admin session found",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
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

    setIsLoading(true);
    
    try {
      const result = await securePlatformAdminService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        admin.email
      );

      if (result.success) {
        toast({
          title: "✅ Password Changed",
          description: "Your password has been updated with enhanced security",
          variant: "default",
        });
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength({ isValid: false, score: 0, feedback: [] });
      } else {
        toast({
          title: "❌ Password Change Failed",
          description: result.error || 'Failed to change password',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "❌ Error",
        description: 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
          <Shield className="w-5 h-5" />
          Change Admin Password
        </CardTitle>
        <p className="text-sm text-gray-600">
          Update your platform admin password with enhanced security requirements
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="Enter new password (min 12 characters)"
                required
                disabled={isLoading}
                minLength={12}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {formData.newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Strength:</span>
                  <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                    {getStrengthLabel(passwordStrength.score)} ({passwordStrength.score}%)
                  </span>
                  {passwordStrength.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                minLength={12}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !passwordStrength.isValid || formData.newPassword !== formData.confirmPassword} 
            className="w-full"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Security Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Minimum 12 characters (16+ recommended)</li>
            <li>• Mix of uppercase and lowercase letters</li>
            <li>• At least one number and special character</li>
            <li>• Avoid common words and patterns</li>
            <li>• No repeated characters or keyboard sequences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
