
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon, UserIcon, SchoolIcon, GraduationCapIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";

interface StudentLoginFormProps {
  onLogin: (fullName: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const StudentLoginForm: React.FC<StudentLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t } = useLanguage();
  const [loginData, setLoginData] = useState({
    fullName: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginData.fullName, loginData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loginFullName" className="flex items-center gap-2 text-black font-medium">
          <UserIcon className="w-4 h-4 text-brand-teal" />
          {t('auth.fullName')}
        </Label>
        <SecurityEnhancedInput
          id="loginFullName"
          type="text"
          placeholder={t('student.fullNamePlaceholder')}
          value={loginData.fullName}
          onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
          required
          validateAs="name"
          maxLength={100}
        />
      </div>


      <div className="space-y-2">
        <Label htmlFor="loginPassword" className="text-black font-medium">{t('auth.password')}</Label>
        <Input
          id="loginPassword"
          type="password"
          placeholder={t('auth.password')}
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
          maxLength={128}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-brand-gradient hover:opacity-90 text-white"
        disabled={isLoading}
      >
        {isLoading ? t('auth.loggingIn') : (
          <>
            <LogInIcon className="w-4 h-4 mr-2" />
            {t('auth.login')}
          </>
        )}
      </Button>
    </form>
  );
};

export default StudentLoginForm;
