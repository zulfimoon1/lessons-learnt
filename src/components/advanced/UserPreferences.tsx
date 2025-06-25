
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Bell, Eye, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface UserPreference {
  id: string;
  category: string;
  key: string;
  label: string;
  type: 'boolean' | 'select' | 'number';
  value: any;
  options?: { value: string; label: string }[];
  description?: string;
}

interface UserPreferencesProps {
  className?: string;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ className }) => {
  const { student, teacher } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize preferences based on user type
    const defaultPreferences: UserPreference[] = [
      // Notification preferences
      {
        id: 'notify-email',
        category: 'notifications',
        key: 'emailNotifications',
        label: t('preferences.emailNotifications') || 'Email Notifications',
        type: 'boolean',
        value: true,
        description: 'Receive important updates via email'
      },
      {
        id: 'notify-push',
        category: 'notifications',
        key: 'pushNotifications',
        label: t('preferences.pushNotifications') || 'Push Notifications',
        type: 'boolean',
        value: true,
        description: 'Receive real-time notifications'
      },
      {
        id: 'notify-frequency',
        category: 'notifications',
        key: 'notificationFrequency',
        label: t('preferences.frequency') || 'Notification Frequency',
        type: 'select',
        value: 'immediate',
        options: [
          { value: 'immediate', label: 'Immediate' },
          { value: 'daily', label: 'Daily Summary' },
          { value: 'weekly', label: 'Weekly Summary' }
        ]
      },
      // Display preferences
      {
        id: 'theme',
        category: 'display',
        key: 'theme',
        label: t('preferences.theme') || 'Theme',
        type: 'select',
        value: 'system',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]
      },
      {
        id: 'language',
        category: 'display',
        key: 'language',
        label: t('preferences.language') || 'Language',
        type: 'select',
        value: language,
        options: [
          { value: 'en', label: 'English' },
          { value: 'lt', label: 'Lietuvių' }
        ]
      },
      // Privacy preferences
      {
        id: 'analytics',
        category: 'privacy',
        key: 'allowAnalytics',
        label: t('preferences.analytics') || 'Usage Analytics',
        type: 'boolean',
        value: true,
        description: 'Help improve the platform by sharing usage data'
      }
    ];

    // Add user-specific preferences
    if (student) {
      defaultPreferences.push({
        id: 'feedback-reminders',
        category: 'learning',
        key: 'feedbackReminders',
        label: t('preferences.feedbackReminders') || 'Feedback Reminders',
        type: 'boolean',
        value: true,
        description: 'Remind me to submit feedback after classes'
      });
    }

    if (teacher) {
      defaultPreferences.push({
        id: 'class-notifications',
        category: 'teaching',
        key: 'classNotifications',
        label: t('preferences.classNotifications') || 'Class Notifications',
        type: 'boolean',
        value: true,
        description: 'Notify me about upcoming classes and changes'
      });
    }

    setPreferences(defaultPreferences);
  }, [student, teacher, language, t]);

  const updatePreference = (id: string, newValue: any) => {
    setPreferences(prev =>
      prev.map(pref => pref.id === id ? { ...pref, value: newValue } : pref)
    );
    setHasChanges(true);

    // Handle language change immediately
    if (id === 'language') {
      setLanguage(newValue as 'en' | 'lt');
    }
  };

  const savePreferences = () => {
    // Here you would typically save to a backend
    console.log('Saving preferences:', preferences);
    
    // Store in localStorage for now
    const preferencesData = preferences.reduce((acc, pref) => {
      acc[pref.key] = pref.value;
      return acc;
    }, {} as Record<string, any>);
    
    localStorage.setItem('userPreferences', JSON.stringify(preferencesData));
    
    setHasChanges(false);
    toast.success(t('preferences.saved') || 'Preferences saved successfully');
  };

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, UserPreference[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notifications':
        return <Bell className="w-4 h-4" />;
      case 'display':
        return <Palette className="w-4 h-4" />;
      case 'privacy':
        return <Eye className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      notifications: t('preferences.notifications') || 'Notifications',
      display: t('preferences.display') || 'Display',
      privacy: t('preferences.privacy') || 'Privacy',
      learning: t('preferences.learning') || 'Learning',
      teaching: t('preferences.teaching') || 'Teaching'
    };
    return titles[category] || category;
  };

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('preferences.title') || 'User Preferences'}
          </CardTitle>
          {hasChanges && (
            <Button onClick={savePreferences} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {t('preferences.save') || 'Save Changes'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedPreferences).map(([category, prefs]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              {getCategoryIcon(category)}
              <h3 className="text-lg font-medium">{getCategoryTitle(category)}</h3>
            </div>
            
            <div className="space-y-4 pl-6">
              {prefs.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={pref.id} className="text-sm font-medium">
                      {pref.label}
                    </Label>
                    {pref.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pref.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {pref.type === 'boolean' && (
                      <Switch
                        id={pref.id}
                        checked={pref.value}
                        onCheckedChange={(checked) => updatePreference(pref.id, checked)}
                      />
                    )}
                    
                    {pref.type === 'select' && (
                      <Select
                        value={pref.value}
                        onValueChange={(value) => updatePreference(pref.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pref.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserPreferences;
