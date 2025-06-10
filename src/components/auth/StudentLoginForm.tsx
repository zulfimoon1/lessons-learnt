
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon, UserIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
        <Label htmlFor="loginFullName" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {t('auth.fullName')}
        </Label>
        <Input
          id="loginFullName"
          type="text"
          placeholder={t('student.fullNamePlaceholder') || "Enter your full name"}
          value={loginData.fullName}
          onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loginPassword">{t('auth.password')}</Label>
        <Input
          id="loginPassword"
          type="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
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
