
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon, UserIcon, SchoolIcon, GraduationCapIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
    
    if (!loginData.fullName.trim() || !loginData.school.trim() || !loginData.grade.trim() || !loginData.password.trim()) {
      return;
    }

    await onLogin(loginData.fullName.trim(), loginData.school.trim(), loginData.grade.trim(), loginData.password);
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
        <Label htmlFor="loginSchool" className="flex items-center gap-2">
          <SchoolIcon className="w-4 h-4" />
          School
        </Label>
        <Input
          id="loginSchool"
          type="text"
          placeholder="Enter your school name"
          value={loginData.school}
          onChange={(e) => setLoginData(prev => ({ ...prev, school: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loginGrade" className="flex items-center gap-2">
          <GraduationCapIcon className="w-4 h-4" />
          Grade/Class
        </Label>
        <Input
          id="loginGrade"
          type="text"
          placeholder="e.g., Grade 5, 10A, Year 9"
          value={loginData.grade}
          onChange={(e) => setLoginData(prev => ({ ...prev, grade: e.target.value }))}
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
        disabled={isLoading || !loginData.fullName.trim() || !loginData.school.trim() || !loginData.grade.trim() || !loginData.password.trim()}
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
