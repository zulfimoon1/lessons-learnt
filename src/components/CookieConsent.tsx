
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowConsent(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent', 'none');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 bg-white shadow-lg border">
        <div className="flex items-start space-x-3">
          <Cookie className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Cookie Preferences</h3>
            <p className="text-xs text-gray-600 mb-3">
              We use cookies to enhance your experience, analyze site usage, and ensure GDPR compliance. 
              Essential cookies are required for platform functionality.
            </p>
            
            {showSettings && (
              <div className="mb-3 space-y-2 text-xs">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>Essential (Required for functionality)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-3 h-3" />
                  <span>Analytics (Help us improve the platform)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-3 h-3" />
                  <span>Performance (Optimize loading times)</span>
                </label>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleAcceptAll} className="text-xs">
                Accept All
              </Button>
              <Button size="sm" variant="outline" onClick={handleAcceptNecessary} className="text-xs">
                Necessary Only
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRejectAll}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
