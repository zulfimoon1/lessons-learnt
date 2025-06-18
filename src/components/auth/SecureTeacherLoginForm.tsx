
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogInIcon, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";
import SecureFormWrapper from "@/components/security/SecureFormWrapper";

interface SecureTeacherLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const SecureTeacherLoginForm: React.FC<SecureTeacherLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t, language } = useLanguage();
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleSecureSubmit = async (formData: Record<string, any>, csrfToken: string) => {
    const email = formData.email as string;
    const password = formData.password as string;
    
    await onLogin(email, password);
  };

  return (
    <SecureFormWrapper onSubmit={handleSecureSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('auth.email')}
        </Label>
        <SecurityEnhancedInput
          name="email"
          type="email"
          placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
          value={loginData.email}
          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
          required
          validateAs="email"
          maxLength={254}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <SecurityEnhancedInput
          name="password"
          type="password"
          placeholder={language === 'lt' ? 'Įveskite slaptažodį' : 'Enter your password'}
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
          validateAs="password"
          maxLength={128}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isLoading}
      >
        {isLoading ? t('auth.loggingIn') : (
          <>
            <LogInIcon className="w-4 h-4 mr-2" />
            {t('auth.login')}
          </>
        )}
      </Button>
    </SecureFormWrapper>
  );
};

export default SecureTeacherLoginForm;
