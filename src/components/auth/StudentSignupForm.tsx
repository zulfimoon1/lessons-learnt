
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserIcon, School, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SecurityEnhancedInput from "@/components/security/SecurityEnhancedInput";

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
        <Label htmlFor="signupFullName" className="flex items-center gap-2 bg-brand-gradient bg-clip-text text-transparent font-medium">
          <UserIcon className="w-4 h-4 text-brand-teal" />
          {t('auth.fullName')}
        </Label>
        <SecurityEnhancedInput
          id="signupFullName"
          type="text"
          placeholder={t('student.fullNameSignupPlaceholder') || "Enter your full name"}
          value={signupData.fullName}
          onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
          required
          validateAs="name"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupSchool" className="flex items-center gap-2 bg-brand-gradient bg-clip-text text-transparent font-medium">
          <School className="w-4 h-4 text-brand-teal" />
          {t('auth.school')}
        </Label>
        <SecurityEnhancedInput
          id="signupSchool"
          type="text"
          placeholder={t('student.schoolPlaceholder') || "Enter your school name"}
          value={signupData.school}
          onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
          required
          validateAs="school"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupGrade" className="flex items-center gap-2 bg-brand-gradient bg-clip-text text-transparent font-medium">
          <GraduationCap className="w-4 h-4 text-brand-teal" />
          {t('student.classGrade') || "Class/Grade"}
        </Label>
        <SecurityEnhancedInput
          id="signupGrade"
          type="text"
          placeholder={t('student.gradePlaceholder') || "e.g., Grade 5, Year 7"}
          value={signupData.grade}
          onChange={(e) => setSignupData(prev => ({ ...prev, grade: e.target.value }))}
          required
          validateAs="grade"
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="bg-brand-gradient bg-clip-text text-transparent font-medium">{t('auth.password')}</Label>
        <SecurityEnhancedInput
          id="signupPassword"
          type="password"
          placeholder={t('student.createPassword') || "Create a password"}
          value={signupData.password}
          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
          required
          validateAs="password"
          maxLength={128}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="bg-brand-gradient bg-clip-text text-transparent font-medium">{t('auth.confirmPassword')}</Label>
        <SecurityEnhancedInput
          id="confirmPassword"
          type="password"
          placeholder={t('student.confirmPasswordPlaceholder') || "Confirm your password"}
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
          validateAs="password"
          maxLength={128}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-brand-gradient hover:opacity-90 text-white"
        disabled={isLoading}
      >
        {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
    </form>
  );
};

export default StudentSignupForm;
