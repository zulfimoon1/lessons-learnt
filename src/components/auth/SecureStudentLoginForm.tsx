
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
  const { t, language } = useLanguage();
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
        <Label htmlFor="fullName" className="flex items-center gap-2 text-brand-dark font-medium">
          <UserIcon className="w-4 h-4 text-brand-teal" />
          {t('auth.fullName')}
        </Label>
        <SecurityEnhancedInput
          name="fullName"
          type="text"
          placeholder={language === 'lt' ? 'Vardas Pavardė' : 'John Smith'}
          value={loginData.fullName}
          onChange={(e) => setLoginData(prev => ({ ...prev, fullName: e.target.value }))}
          required
          validateAs="name"
          maxLength={100}
          className="bg-white border-gray-300 focus:border-brand-teal focus:ring-brand-teal text-brand-dark placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school" className="flex items-center gap-2 text-brand-dark font-medium">
          <SchoolIcon className="w-4 h-4 text-brand-teal" />
          {t('auth.school')}
        </Label>
        <SecurityEnhancedInput
          name="school"
          type="text"
          placeholder={language === 'lt' ? 'Vilniaus licėjus' : 'Central High School'}
          value={loginData.school}
          onChange={(e) => setLoginData(prev => ({ ...prev, school: e.target.value }))}
          required
          validateAs="school"
          maxLength={200}
          className="bg-white border-gray-300 focus:border-brand-teal focus:ring-brand-teal text-brand-dark placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade" className="flex items-center gap-2 text-brand-dark font-medium">
          <GraduationCapIcon className="w-4 h-4 text-brand-teal" />
          {t('auth.gradeClass')}
        </Label>
        <SecurityEnhancedInput
          name="grade"
          type="text"
          placeholder={language === 'lt' ? '10A, 9 klasė' : 'Grade 5, 10A'}
          value={loginData.grade}
          onChange={(e) => setLoginData(prev => ({ ...prev, grade: e.target.value }))}
          required
          validateAs="grade"
          maxLength={50}
          className="bg-white border-gray-300 focus:border-brand-teal focus:ring-brand-teal text-brand-dark placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-brand-dark font-medium">{t('auth.password')}</Label>
        <SecurityEnhancedInput
          name="password"
          type="password"
          placeholder={language === 'lt' ? 'Įveskite slaptažodį' : 'Enter your password'}
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
          validateAs="password"
          maxLength={128}
          className="bg-white border-gray-300 focus:border-brand-teal focus:ring-brand-teal text-brand-dark placeholder:text-gray-500"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-brand-teal hover:bg-brand-dark text-white font-medium py-3"
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
