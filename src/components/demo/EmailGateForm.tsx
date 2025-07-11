import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Globe } from 'lucide-react';

const emailGateSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  language: z.enum(['en', 'lt'], { required_error: 'Please select a language' }),
  marketingConsent: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive marketing content to watch the demo'
  })
});

type EmailGateFormData = z.infer<typeof emailGateSchema>;

interface EmailGateFormProps {
  onFormSubmit: (data: EmailGateFormData) => void;
  isSubmitting?: boolean;
}

const EmailGateForm: React.FC<EmailGateFormProps> = ({ onFormSubmit, isSubmitting = false }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<EmailGateFormData>({
    resolver: zodResolver(emailGateSchema),
    defaultValues: {
      email: '',
      language: language,
      marketingConsent: false
    },
    mode: 'onChange'
  });

  const watchedLanguage = watch('language');
  const watchedMarketingConsent = watch('marketingConsent');

  const onSubmit = async (data: EmailGateFormData) => {
    try {
      // Call HubSpot integration edge function
      const { data: hubspotResponse, error } = await supabase.functions.invoke('hubspot-lead-capture', {
        body: {
          email: data.email,
          language: data.language,
          source: 'demo_video_gate',
          marketingConsent: data.marketingConsent
        }
      });

      if (error) {
        console.error('HubSpot integration error:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit form. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success!',
        description: 'Thank you! Your demo video is loading...',
      });

      // Pass data to parent component
      onFormSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="max-w-lg mx-auto shadow-xl border-0 bg-white">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-teal" />
        </div>
        <CardTitle className="text-2xl font-bold text-brand-dark">
          {t('demo.emailGate.title') || 'Watch Live Demo'}
        </CardTitle>
        <p className="text-gray-600 mt-2">
          {t('demo.emailGate.subtitle') || 'Enter your email to access our comprehensive platform demonstration'}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('demo.emailGate.emailLabel') || 'Email Address'} *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('demo.emailGate.emailPlaceholder') || 'your.email@example.com'}
              {...register('email')}
              className={`h-12 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('demo.emailGate.languageLabel') || 'Demo Language'} *
            </Label>
            <Select
              value={watchedLanguage}
              onValueChange={(value) => setValue('language', value as 'en' | 'lt', { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('demo.emailGate.languagePlaceholder') || 'Select demo language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  🇺🇸 {t('language.english') || 'English'}
                </SelectItem>
                <SelectItem value="lt">
                  🇱🇹 {t('language.lithuanian') || 'Lietuvių kalba'}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>

          {/* Marketing Consent */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox
                id="marketingConsent"
                checked={watchedMarketingConsent}
                onCheckedChange={(checked) => setValue('marketingConsent', checked === true, { shouldValidate: true })}
                disabled={isSubmitting}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="marketingConsent" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  {t('demo.emailGate.consentText') || 'By watching this demo, you agree to receive marketing content from lessonslearnt.eu'} *
                </Label>
              </div>
            </div>
            {errors.marketingConsent && (
              <p className="text-sm text-red-600">{errors.marketingConsent.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full h-12 bg-brand-teal hover:bg-brand-dark text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('demo.emailGate.submitting') || 'Loading Demo...'}
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                {t('demo.emailGate.watchDemo') || 'Watch Demo Video'}
              </>
            )}
          </Button>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {t('demo.emailGate.privacyNotice') || 'We respect your privacy. Your email will only be used for demo access and marketing communications from lessonslearnt.eu. You can unsubscribe at any time.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailGateForm;