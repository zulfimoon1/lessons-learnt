import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserIcon, Mail, School, ShieldIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeacherSignupFormProps {
  onSignup: (name: string, email: string, school: string, password: string, confirmPassword: string, role: string) => Promise<void>;
  isLoading: boolean;
}

const TeacherSignupForm: React.FC<TeacherSignupFormProps> = ({ onSignup, isLoading }) => {
  const { t, language } = useLanguage();
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    school: "",
    role: "teacher" as "teacher" | "admin" | "doctor",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignup(signupData.name, signupData.email, signupData.school, signupData.password, signupData.confirmPassword, signupData.role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signupName" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {t('auth.fullName')}
        </Label>
        <Input
          id="signupName"
          type="text"
          placeholder={language === 'lt' ? 'Įveskite vardą ir pavardę' : 'Enter your full name'}
          value={signupData.name}
          onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupEmail" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('auth.email')}
        </Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
          value={signupData.email}
          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
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
          placeholder={language === 'lt' ? 'Įveskite mokyklos pavadinimą' : 'Enter school name'}
          value={signupData.school}
          onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="flex items-center gap-2">
          <ShieldIcon className="w-4 h-4" />
          {t('login.teacher.role')}
        </Label>
        <Select 
          value={signupData.role} 
          onValueChange={(value: "teacher" | "admin" | "doctor") => 
            setSignupData(prev => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={language === 'lt' ? 'Pasirinkite vaidmenį' : 'Select role'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">{t('login.teacher.roleTeacher')}</SelectItem>
            <SelectItem value="admin">{t('login.teacher.roleAdmin')}</SelectItem>
            <SelectItem value="doctor">
              {language === 'lt' ? 'Psichinės sveikatos specialistas' : 'Mental Health Professional'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword">{t('auth.password')}</Label>
        <Input
          id="signupPassword"
          type="password"
          placeholder={language === 'lt' ? 'Sukurkite slaptažodį' : 'Create a password'}
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
          placeholder={language === 'lt' ? 'Patvirtinkite slaptažodį' : 'Confirm your password'}
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isLoading}
      >
        {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
    </form>
  );
};

export default TeacherSignupForm;
