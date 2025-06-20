
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogInIcon, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeacherLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const TeacherLoginForm: React.FC<TeacherLoginFormProps> = ({ onLogin, isLoading }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(formData.email, formData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {t('auth.email')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={language === 'lt' ? 'mokytojas@mokykla.lt' : 'teacher@school.com'}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input
          id="password"
          type="password"
          placeholder={language === 'lt' ? 'Įveskite slaptažodį' : 'Enter your password'}
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
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

export default TeacherLoginForm;
