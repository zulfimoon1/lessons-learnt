
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlusIcon, UserIcon, SchoolIcon, GraduationCapIcon } from "lucide-react";
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
    await onSignup(signupData.fullName, signupData.school, signupData.grade, signupData.password, signupData.confirmPassword);
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
          placeholder="Enter your full name"
          value={signupData.fullName}
          onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupSchool" className="flex items-center gap-2">
          <SchoolIcon className="w-4 h-4" />
          School
        </Label>
        <Input
          id="signupSchool"
          type="text"
          placeholder="Enter your school name"
          value={signupData.school}
          onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupGrade" className="flex items-center gap-2">
          <GraduationCapIcon className="w-4 h-4" />
          Grade/Class
        </Label>
        <Input
          id="signupGrade"
          type="text"
          placeholder="e.g., Grade 5, 10A, Year 9"
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
          placeholder="Create a password"
          value={signupData.password}
          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
        <Input
          id="signupConfirmPassword"
          type="password"
          placeholder="Confirm your password"
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
        {isLoading ? "Creating Account..." : (
          <>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            {t('auth.signUp')}
          </>
        )}
      </Button>
    </form>
  );
};

export default StudentSignupForm;
