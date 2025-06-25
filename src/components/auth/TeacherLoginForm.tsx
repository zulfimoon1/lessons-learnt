
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";

interface TeacherLoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

const TeacherLoginForm: React.FC<TeacherLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-brand-dark">Email</Label>
        <SecurityEnhancedInput
          id="email"
          type="email"
          placeholder="teacher@school.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          validateAs="email"
          maxLength={254}
          className="border-gray-300 focus:border-brand-teal focus:ring-brand-teal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-brand-dark">Password</Label>
        <div className="relative">
          <SecurityEnhancedInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            validateAs="password"
            maxLength={128}
            className="border-gray-300 focus:border-brand-teal focus:ring-brand-teal pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="text-right">
        <ForgotPasswordDialog>
          <button
            type="button"
            className="text-sm text-brand-teal hover:text-brand-dark transition-colors"
          >
            Forgot Password?
          </button>
        </ForgotPasswordDialog>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-brand-teal hover:bg-brand-dark text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Signing In...
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default TeacherLoginForm;
