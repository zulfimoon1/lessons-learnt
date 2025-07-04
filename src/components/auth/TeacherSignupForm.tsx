
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserIcon, Mail, School, ShieldIcon, ChevronDownIcon } from "lucide-react";
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
        <Label htmlFor="signupName" className="flex items-center gap-2 text-black font-medium">
          <UserIcon className="w-4 h-4 text-brand-teal" />
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
        <Label htmlFor="signupEmail" className="flex items-center gap-2 text-black font-medium">
          <Mail className="w-4 h-4 text-brand-teal" />
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
        <Label htmlFor="signupSchool" className="flex items-center gap-2 text-black font-medium">
          <School className="w-4 h-4 text-brand-teal" />
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
        <Label htmlFor="role" className="flex items-center gap-2 text-black font-medium">
          <ShieldIcon className="w-4 h-4 text-brand-teal" />
          {t('login.teacher.role')}
        </Label>
        <Select 
          value={signupData.role} 
          onValueChange={(value: "teacher" | "admin" | "doctor") => 
            setSignupData(prev => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder={language === 'lt' ? 'Pasirinkite vaidmenį' : 'Select your role'} />
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <SelectItem value="teacher" className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
              {t('login.teacher.roleTeacher')}
            </SelectItem>
            <SelectItem value="admin" className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
              {t('login.teacher.roleAdmin')}
            </SelectItem>
            <SelectItem value="doctor" className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
              {language === 'lt' ? 'Psichinės sveikatos specialistas' : 'Mental Health Professional'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="text-black font-medium">{t('auth.password')}</Label>
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
        <Label htmlFor="confirmPassword" className="text-black font-medium">{t('auth.confirmPassword')}</Label>
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
        className="w-full bg-brand-gradient hover:opacity-90 text-white"
        disabled={isLoading}
      >
        {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
    </form>
  );
};

export default TeacherSignupForm;
