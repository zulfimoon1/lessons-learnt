
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useSafeLanguage } from "@/contexts/SafeLanguageContext";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";

interface TeacherLoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

const TeacherLoginForm: React.FC<TeacherLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t } = useSafeLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onLogin(email.trim().toLowerCase(), password);
  };

  const getInputClassName = (fieldName: 'email' | 'password') => {
    const baseClasses = "border-gray-300 focus:border-brand-teal focus:ring-brand-teal";
    const errorClasses = "border-red-300 focus:border-red-500 focus:ring-red-500";
    return validationErrors[fieldName] ? errorClasses : baseClasses;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-brand-dark">
          {t('auth.email') || 'Email'}
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder') || 'teacher@school.com'}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors(prev => ({...prev, email: undefined}));
              }
            }}
            className={getInputClassName('email')}
            disabled={isLoading}
          />
          {email && !validationErrors.email && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {validationErrors.email && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        {validationErrors.email && (
          <p className="text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-brand-dark">
          {t('auth.password') || 'Password'}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.passwordPlaceholder') || '••••••••'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors(prev => ({...prev, password: undefined}));
              }
            }}
            className={`${getInputClassName('password')} pr-10`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div className="text-right">
        <ForgotPasswordDialog>
          <button
            type="button"
            className="text-sm text-brand-teal hover:text-brand-dark transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {t('auth.forgotPassword') || 'Forgot Password?'}
          </button>
        </ForgotPasswordDialog>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-brand-teal hover:bg-brand-dark text-white disabled:opacity-50"
        disabled={isLoading || Object.keys(validationErrors).length > 0}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t('auth.signingIn') || 'Signing In...'}
          </div>
        ) : (
          t('auth.signIn') || 'Sign In'
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          {t('auth.loginTip') || 'Use your school-provided email address to log in'}
        </p>
      </div>
    </form>
  );
};

export default TeacherLoginForm;
