
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlusIcon, Mail, User, School, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeacherSignupFormProps {
  onSignup: (signupData: {
    name: string;
    email: string;
    school: string;
    role: 'teacher' | 'admin' | 'doctor';
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const TeacherSignupForm: React.FC<TeacherSignupFormProps> = ({ onSignup, isLoading }) => {
  const { t } = useLanguage();
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    school: "",
    role: "teacher" as 'teacher' | 'admin' | 'doctor',
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignup(signupData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signupName" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {t('auth.fullName')}
        </Label>
        <Input
          id="signupName"
          type="text"
          placeholder="Enter your full name"
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
          placeholder="teacher@school.com"
          value={signupData.email}
          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupSchool" className="flex items-center gap-2">
          <School className="w-4 h-4" />
          School
        </Label>
        <Input
          id="signupSchool"
          type="text"
          placeholder="School name"
          value={signupData.school}
          onChange={(e) => setSignupData(prev => ({ ...prev, school: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupRole" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Role
        </Label>
        <Select
          value={signupData.role}
          onValueChange={(value: 'teacher' | 'admin' | 'doctor') => 
            setSignupData(prev => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="doctor">Mental Health Professional</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
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

export default TeacherSignupForm;
