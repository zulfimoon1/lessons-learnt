
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStorage } from '@/hooks/useAuthStorage';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TeacherLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { teacherLogin } = useAuth();
  const { saveTeacher } = useAuthStorage();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        title: t('common.error'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('TeacherLoginForm: Starting login process');
    
    try {
      const result = await teacherLogin(email.trim(), password);
      
      if (result.error) {
        console.log('TeacherLoginForm: Login failed:', result.error);
        toast({
          title: t('common.error'),
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.teacher) {
        console.log('TeacherLoginForm: Login successful, saving teacher and navigating');
        saveTeacher(result.teacher);
        
        // Navigate based on role
        if (result.teacher.role === 'admin') {
          console.log('TeacherLoginForm: Navigating to admin dashboard');
          navigate('/school-admin-dashboard', { replace: true });
        } else {
          console.log('TeacherLoginForm: Navigating to teacher dashboard');
          navigate('/teacher-dashboard', { replace: true });
        }
        
        toast({
          title: t('common.success'),
          description: `${t('auth.welcome')}, ${result.teacher.name}!`,
        });
      }
    } catch (error) {
      console.error('TeacherLoginForm: Unexpected error:', error);
      toast({
        title: t('common.error'),
        description: t('auth.loginFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.teacherLogin')}</CardTitle>
        <CardDescription>
          {t('auth.enterCredentials')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? t('auth.loggingIn') : t('auth.login')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherLoginForm;
