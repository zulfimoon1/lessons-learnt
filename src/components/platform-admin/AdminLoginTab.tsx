
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogInIcon, Mail, Lock } from 'lucide-react';

interface AdminLoginTabProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminLoginTab: React.FC<AdminLoginTabProps> = ({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Admin Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@platform.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your admin password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || !email.trim() || !password.trim()}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing In...
          </>
        ) : (
          <>
            <LogInIcon className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>

      <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="font-semibold">Demo Credentials:</p>
        <p>Email: zulfimoon1@gmail.com</p>
        <p>Password: admin123</p>
      </div>
    </form>
  );
};

export default AdminLoginTab;
