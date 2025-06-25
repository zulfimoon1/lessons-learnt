
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Settings, Shield } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  performance: boolean;
}

const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    performance: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    } else {
      // Load existing preferences
      const savedPreferences = localStorage.getItem('cookie-preferences');
      if (savedPreferences) {
        setPreferences({ ...preferences, ...JSON.parse(savedPreferences) });
      }
    }
  }, []);

  const logConsent = async (consentType: string, given: boolean) => {
    try {
      // Simple consent logging to localStorage for now
      const consentLog = {
        type: consentType,
        given: given,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('consent-logs') || '[]');
      existingLogs.push(consentLog);
      localStorage.setItem('consent-logs', JSON.stringify(existingLogs));
      
      console.log('Consent logged:', consentLog);
    } catch (error) {
      console.log('Failed to log consent:', error);
      // Non-blocking - consent still works without logging
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      performance: true,
    };
    
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    
    // Log each consent type
    await Promise.all([
      logConsent('analytics', true),
      logConsent('marketing', true),
      logConsent('performance', true)
    ]);
    
    setShowConsent(false);
  };

  const handleAcceptSelected = async () => {
    localStorage.setItem('cookie-consent', 'selected');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    
    // Log each consent type based on preferences
    await Promise.all([
      logConsent('analytics', preferences.analytics),
      logConsent('marketing', preferences.marketing),
      logConsent('performance', preferences.performance)
    ]);
    
    setShowConsent(false);
  };

  const handleRejectAll = async () => {
    const rejected = {
      essential: true, // Essential always remains true
      analytics: false,
      marketing: false,
      performance: false,
    };
    
    localStorage.setItem('cookie-consent', 'essential-only');
    localStorage.setItem('cookie-preferences', JSON.stringify(rejected));
    setPreferences(rejected);
    
    // Log rejection
    await Promise.all([
      logConsent('analytics', false),
      logConsent('marketing', false),
      logConsent('performance', false)
    ]);
    
    setShowConsent(false);
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cannot be changed
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-lg">
      <Card className="p-6 bg-white shadow-xl border-2 border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-gray-900">
                {t('privacy.cookieConsent')}
              </h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRejectAll}
                className="p-1 h-auto hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t('privacy.consentNotice')}
            </p>
            
            {showSettings && (
              <div className="mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-900 mb-3">
                  {t('privacy.cookieSettings')}
                </h4>
                
                {/* Essential Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('privacy.essential')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('privacy.essentialDescription')}
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={true} 
                    disabled 
                    className="w-4 h-4 mt-1 text-blue-600"
                  />
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('privacy.analytics')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('privacy.analyticsDescription')}
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600"
                  />
                </div>
                
                {/* Performance Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('privacy.performance')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('privacy.performanceDescription')}
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={preferences.performance}
                    onChange={(e) => updatePreference('performance', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600"
                  />
                </div>
                
                {/* Marketing Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('privacy.marketing')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('privacy.marketingDescription')}
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600"
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={handleAcceptAll} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2"
              >
                {t('privacy.acceptAll')}
              </Button>
              
              {showSettings && (
                <Button 
                  size="sm" 
                  onClick={handleAcceptSelected} 
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2"
                >
                  {t('privacy.acceptSelected')}
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs px-4 py-2 border-gray-300"
              >
                <Settings className="w-3 h-3 mr-1" />
                {t('privacy.managePreferences')}
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRejectAll}
                className="text-xs px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('privacy.rejectAll')}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
