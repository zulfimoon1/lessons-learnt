
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, School, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentSignupFormProps {
  onSignup: (fullName: string, school: string, grade: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
}

const StudentSignupForm: React.FC<StudentSignupFormProps> = ({ onSignup, isLoading }) => {
  const { t } = useLanguage();
  const [signupData, setSignupData] = useState({
    fullName: "",
    school: "",
    grade: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignup(
      signupData.fullName,
      signupData.school,
      signupData.grade,
      signupData.password,
      signupData.confirmPassword
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signupFullName" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {t('auth.fullName')}
        </Label>
        <Input
          id="signupFullName"
          type="text"
          placeholder={t('student.fullNameSignupPlaceholder') || "Enter your full name"}
          value={signupData.fullName}
          onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupSchool" className="flex items-center gap-2">
          <School className="w-4 h-4" />
          {t('auth.school')}
        </Label>
        <Input
          id="signupSchool"
          type="text"
          placeholder={t('student.schoolPlaceholder') || "Enter your school name"}
          value={signupData.school}
          onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupGrade" className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          {t('student.classGrade') || "Class/Grade"}
        </Label>
        <Input
          id="signupGrade"
          type="text"
          placeholder={t('student.gradePlaceholder') || "e.g., Grade 5, Year 7"}
          value={signupData.grade}
          onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword">{t('auth.password')}</Label>
        <Input
          id="signupPassword"
          type="password"
          placeholder={t('student.createPassword') || "Create a password"}
          value={signupData.password}
          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t('student.confirmPasswordPlaceholder') || "Confirm your password"}
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
    </form>
  );
};

export default StudentSignupForm;
