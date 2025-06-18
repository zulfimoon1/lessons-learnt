
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogInIcon, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSecureAuth } from "@/components/security/SecureAuthProvider";
import SecureFormValidation from "@/components/security/SecureFormValidation";

interface SecureTeacherLoginFormProps {
  onLogin?: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

const SecureTeacherLoginForm: React.FC<SecureTeacherLoginFormProps> = ({ 
  onLogin, 
  isLoading: externalLoading 
}) => {
  const { t, language } = useLanguage();
  const { login } = useSecureAuth();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (onLogin) {
        await onLogin(loginData.email, loginData.password);
      } else {
        await login(loginData.email, loginData.password);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || externalLoading;

  return (
    <SecureFormValidation 
      onValidationChange={(valid, errors) => {
        setIsFormValid(valid);
        setFieldErrors(errors);
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {t('auth.email')}
          </Label>
          <Input
            name="email"
            type="email"
            placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
            value={loginData.email}
            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
            required
            maxLength={254}
          />
          {fieldErrors.email && (
            <div className="text-sm text-red-600">
              {fieldErrors.email.join(', ')}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            name="password"
            type="password"
            placeholder={language === 'lt' ? 'Įveskite slaptažodį' : 'Enter your password'}
            value={loginData.password}
            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
            required
            maxLength={128}
          />
          {fieldErrors.password && (
            <div className="text-sm text-red-600">
              {fieldErrors.password.join(', ')}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={loading || !isFormValid}
        >
          {loading ? t('auth.loggingIn') : (
            <>
              <LogInIcon className="w-4 h-4 mr-2" />
              {t('auth.login')}
            </>
          )}
        </Button>
      </form>
    </SecureFormValidation>
  );
};

export default SecureTeacherLoginForm;
