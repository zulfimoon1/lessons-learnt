
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogInIcon, UserIcon, SchoolIcon, GraduationCapIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";
import SecureFormWrapper from "@/components/security/SecureFormWrapper";

interface SecureStudentLoginFormProps {
  onLogin: (fullName: string, school: string, grade: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const SecureStudentLoginForm: React.FC<SecureStudentLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t } = useLanguage();
  const [loginData, setLoginData] = useState({
    fullName: "",
    school: "",
    grade: "",
    password: ""
  });

  const handleSecureSubmit = async (formData: FormData, csrfToken: string) => {
    const fullName = formData.get('fullName') as string;
    const school = formData.get('school') as string;
    const grade = formData.get('grade') as string;
    const password = formData.get('password') as string;
    
    await onLogin(fullName, school, grade, password);
  };

  return (
    <SecureFormWrapper onSubmit={handleSecureSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {t('auth.fullName')}
        </Label>
        <SecurityEnhancedInput
          name="fullName"
          type="text"
          placeholder={t('student.fullNamePlaceholder') || "Enter your full name"}
          value={loginData.fullName}
          onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
          required
          validateAs="name"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school" className="flex items-center gap-2">
          <SchoolIcon className="w-4 h-4" />
          School
        </Label>
        <SecurityEnhancedInput
          name="school"
          type="text"
          placeholder="Enter your school name"
          value={loginData.school}
          onChange={(e) => setLoginData(prev => ({ ...prev, school: e.target.value }))}
          required
          validateAs="school"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade" className="flex items-center gap-2">
          <GraduationCapIcon className="w-4 h-4" />
          Grade/Class
        </Label>
        <SecurityEnhancedInput
          name="grade"
          type="text"
          placeholder="e.g., Grade 5, 10A, Year 9"
          value={loginData.grade}
          onChange={(e) => setLoginData(prev => ({ ...prev, grade: e.target.value }))}
          required
          validateAs="grade"
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <SecurityEnhancedInput
          name="password"
          type="password"
          placeholder="Enter your password"
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
    </SecureFormWrapper>
  );
};

export default SecureStudentLoginForm;
