
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogInIcon, UserIcon, SchoolIcon, GraduationCapIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";

interface StudentLoginFormProps {
  onLogin: (fullName: string, school: string, grade: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const StudentLoginForm: React.FC<StudentLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t } = useLanguage();
  const [loginData, setLoginData] = useState({
    fullName: "",
    school: "",
    grade: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginData.fullName, loginData.school, loginData.grade, loginData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loginFullName" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
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
        <Label htmlFor="loginSchool" className="flex items-center gap-2">
          <SchoolIcon className="w-4 h-4" />
          {t('student.school')}
        </Label>
        <SecurityEnhancedInput
          id="loginSchool"
          type="text"
          placeholder={t('student.schoolPlaceholder')}
          value={loginData.school}
          onChange={(e) => setLoginData(prev => ({ ...prev, school: e.target.value }))}
          required
          validateAs="school"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loginGrade" className="flex items-center gap-2">
          <GraduationCapIcon className="w-4 h-4" />
          {t('student.classGrade')}
        </Label>
        <SecurityEnhancedInput
          id="loginGrade"
          type="text"
          placeholder={t('student.gradePlaceholder')}
          value={loginData.grade}
          onChange={(e) => setLoginData(prev => ({ ...prev, grade: e.target.value }))}
          required
          validateAs="grade"
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loginPassword">{t('auth.password')}</Label>
        <SecurityEnhancedInput
          id="loginPassword"
          type="password"
          placeholder={t('auth.password')}
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
          validateAs="password"
          maxLength={128}
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
