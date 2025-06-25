
import React, { useState } from 'react';
import { AccessibleButton } from '@/components/ui/accessible-button';
import MobileFormField from '@/components/ui/mobile-form-field';
import ScreenReaderOnly from '@/components/accessibility/ScreenReaderOnly';
import FocusIndicator from '@/components/accessibility/FocusIndicator';
import SecurityEnhancedInput from '@/components/security/SecurityEnhancedInput';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EnhancedLoginFormProps {
  type: 'student' | 'teacher';
  onSubmit: (...args: any[]) => Promise<void>;
  isLoading: boolean;
}

const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({
  type,
  onSubmit,
  isLoading
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    school: '',
    grade: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'student') {
      await onSubmit(formData.fullName, formData.school, formData.grade, formData.password);
    } else {
      await onSubmit(formData.email, formData.password);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      noValidate
      aria-label={`${type} login form`}
    >
      <ScreenReaderOnly>
        <h2>
          {type === 'student' 
            ? t('login.student.title') || 'Student Login'
            : t('login.teacher.title') || 'Teacher Login'
          }
        </h2>
      </ScreenReaderOnly>

      {type === 'teacher' ? (
        <MobileFormField
          label={t('auth.email') || 'Email'}
          required
          error={!formData.email.includes('@') && formData.email ? 'Please enter a valid email address' : ''}
        >
          <SecurityEnhancedInput
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder={t('auth.emailPlaceholder') || 'Enter your email'}
            required
            validateAs="email"
            maxLength={254}
            autoComplete="email"
            aria-describedby="email-help"
          />
        </MobileFormField>
      ) : (
        <>
          <MobileFormField
            label={t('auth.fullName') || 'Full Name'}
            required
          >
            <SecurityEnhancedInput
              type="text"
              value={formData.fullName}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              placeholder={t('student.fullNamePlaceholder') || 'Enter your full name'}
              required
              validateAs="name"
              maxLength={100}
              autoComplete="name"
            />
          </MobileFormField>

          <MobileFormField
            label={t('auth.school') || 'School'}
            required
          >
            <SecurityEnhancedInput
              type="text"
              value={formData.school}
              onChange={(e) => updateFormData('school', e.target.value)}
              placeholder={t('student.schoolPlaceholder') || 'Enter your school name'}
              required
              validateAs="school"
              maxLength={200}
              autoComplete="organization"
            />
          </MobileFormField>

          <MobileFormField
            label={t('auth.gradeClass') || 'Grade/Class'}
            required
          >
            <SecurityEnhancedInput
              type="text"
              value={formData.grade}
              onChange={(e) => updateFormData('grade', e.target.value)}
              placeholder={t('student.gradePlaceholder') || 'e.g., Grade 5, 10A'}
              required
              validateAs="grade"
              maxLength={50}
            />
          </MobileFormField>
        </>
      )}

      <MobileFormField
        label={t('auth.password') || 'Password'}
        required
      >
        <SecurityEnhancedInput
          type="password"
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          placeholder={t('auth.passwordPlaceholder') || 'Enter your password'}
          required
          validateAs="password"
          maxLength={128}
          autoComplete="current-password"
        />
      </MobileFormField>

      <FocusIndicator variant="primary">
        <AccessibleButton
          type="submit"
          className={cn(
            'w-full bg-brand-teal hover:bg-brand-dark text-white font-medium',
            isMobile ? 'py-3 text-base' : 'py-2'
          )}
          disabled={isLoading}
          isLoading={isLoading}
          loadingText={t('auth.loggingIn') || 'Signing in...'}
          mobileOptimized={true}
        >
          {t('auth.login') || 'Sign In'}
        </AccessibleButton>
      </FocusIndicator>

      <ScreenReaderOnly>
        <div id="email-help">
          {type === 'teacher' && 'Enter the email address associated with your teaching account'}
        </div>
      </ScreenReaderOnly>
    </form>
  );
};

export default EnhancedLoginForm;
