
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';
import { translationValidationService } from '@/services/translationValidationService';
import TranslationErrorBoundary from './TranslationErrorBoundary';

type Language = 'en' | 'lt';

interface EnhancedLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
  isValidationEnabled: boolean;
  enableValidation: () => void;
  disableValidation: () => void;
  translationHealth: { healthy: boolean; criticalIssues: string[] } | null;
}

const defaultContextValue: EnhancedLanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: false,
  isValidationEnabled: false,
  enableValidation: () => {},
  disableValidation: () => {},
  translationHealth: null
};

const EnhancedLanguageContext = createContext<EnhancedLanguageContextType>(defaultContextValue);

export const EnhancedLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isValidationEnabled, setIsValidationEnabled] = useState(false);
  const [translationHealth, setTranslationHealth] = useState<{ healthy: boolean; criticalIssues: string[] } | null>(null);
  const [translationErrors, setTranslationErrors] = useState<string[]>([]);

  useEffect(() => {
    initializeLanguage();
    performHealthCheck();
  }, []);

  useEffect(() => {
    if (isValidationEnabled) {
      performHealthCheck();
    }
  }, [language, isValidationEnabled]);

  const initializeLanguage = async () => {
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lt')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error);
      logTranslationError('Failed to initialize language', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performHealthCheck = async () => {
    if (!isValidationEnabled) return;
    
    try {
      const health = await translationValidationService.quickHealthCheck();
      setTranslationHealth(health);
      
      if (!health.healthy) {
        console.warn('Translation health issues detected:', health.criticalIssues);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      logTranslationError('Health check failed', error);
    }
  };

  const changeLanguage = (lang: Language) => {
    try {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      
      if (isValidationEnabled) {
        // Validate language switch
        setTimeout(performHealthCheck, 100);
      }
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
      logTranslationError('Failed to change language', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      let translation = translations[language]?.[key] || translations.en[key] || key;
      
      // Log missing translations when validation is enabled
      if (isValidationEnabled && !translations[language]?.[key] && translations.en[key]) {
        logTranslationError(`Missing ${language} translation for key: ${key}`);
      }
      
      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.entries(params).forEach(([param, value]) => {
          const placeholder = `{${param}}`;
          if (translation.includes(placeholder)) {
            translation = translation.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
          } else if (isValidationEnabled) {
            logTranslationError(`Parameter ${param} not found in translation: ${key}`);
          }
        });
      }
      
      return translation;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      logTranslationError(`Translation error for key "${key}"`, error);
      return key; // Fallback to key
    }
  };

  const logTranslationError = (message: string, error?: any) => {
    const errorMessage = `${message}${error ? ': ' + (error.message || error) : ''}`;
    
    setTranslationErrors(prev => {
      const newErrors = [...prev, errorMessage].slice(-10); // Keep last 10 errors
      return newErrors;
    });
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('translation_runtime_errors') || '[]');
      existingErrors.push({
        message: errorMessage,
        timestamp: new Date().toISOString(),
        language,
        error: error?.toString()
      });
      localStorage.setItem('translation_runtime_errors', JSON.stringify(existingErrors.slice(-50)));
    } catch (e) {
      console.warn('Could not store translation runtime error:', e);
    }
  };

  const enableValidation = () => {
    setIsValidationEnabled(true);
    translationValidationService.enableTestingMode();
    performHealthCheck();
  };

  const disableValidation = () => {
    setIsValidationEnabled(false);
    translationValidationService.disableTestingMode();
    setTranslationHealth(null);
    setTranslationErrors([]);
  };

  const contextValue: EnhancedLanguageContextType = {
    language,
    setLanguage: changeLanguage,
    t,
    isLoading,
    isValidationEnabled,
    enableValidation,
    disableValidation,
    translationHealth
  };

  return (
    <EnhancedLanguageContext.Provider value={contextValue}>
      <TranslationErrorBoundary>
        {children}
        
        {/* Development-only error display */}
        {process.env.NODE_ENV === 'development' && isValidationEnabled && translationErrors.length > 0 && (
          <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-100 border border-yellow-300 rounded p-3 z-50">
            <div className="text-sm font-medium text-yellow-800">Translation Issues ({translationErrors.length})</div>
            <div className="text-xs text-yellow-700 mt-1 max-h-20 overflow-y-auto">
              {translationErrors.slice(-3).map((error, index) => (
                <div key={index} className="mt-1">{error}</div>
              ))}
            </div>
          </div>
        )}
      </TranslationErrorBoundary>
    </EnhancedLanguageContext.Provider>
  );
};

export const useEnhancedLanguage = () => {
  const context = useContext(EnhancedLanguageContext);
  if (!context) {
    console.warn('useEnhancedLanguage: Context not found, using default');
    return defaultContextValue;
  }
  return context;
};
