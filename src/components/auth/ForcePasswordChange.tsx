
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForcePasswordChangeProps {
  studentId: string;
  studentName: string;
  onPasswordChanged: () => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({
  studentId,
  studentName,
  onPasswordChanged
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('student_change_password_after_reset', {
        student_id_param: studentId,
        new_password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        toast.error('Failed to change password: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          toast.success('Password changed successfully! You can now use your new password.');
          onPasswordChanged();
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-brand-orange/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-brand-orange rounded-full mx-auto flex items-center justify-center mb-4">
            <KeyIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-brand-dark">Change Your Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Hello {studentName}! Your teacher has reset your password. 
              Please create a new password to continue.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isLoading}
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
                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>

          <Alert>
            <AlertDescription className="text-sm">
              Your password must be at least 4 characters long. Choose something you'll remember!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
