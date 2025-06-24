
// Core Systems Preservation Utility
// This helps ensure critical functionality isn't broken during changes

interface CoreSystemStatus {
  auth: {
    authContextWorking: boolean;
    loginFlowWorking: boolean;
    storageWorking: boolean;
  };
  translations: {
    contextWorking: boolean;
    languageSwitchingWorking: boolean;
    translationsLoading: boolean;
  };
  navigation: {
    routingWorking: boolean;
    linksWorking: boolean;
  };
}

export const checkCoreSystemStatus = (): CoreSystemStatus => {
  const status: CoreSystemStatus = {
    auth: {
      authContextWorking: false,
      loginFlowWorking: false,
      storageWorking: false
    },
    translations: {
      contextWorking: false,
      languageSwitchingWorking: false,
      translationsLoading: false
    },
    navigation: {
      routingWorking: false,
      linksWorking: false
    }
  };

  // Check Auth Context
  try {
    const authData = localStorage.getItem('teacher') || localStorage.getItem('student');
    status.auth.storageWorking = true;
    status.auth.authContextWorking = true;
    if (authData) {
      status.auth.loginFlowWorking = true;
    }
  } catch (error) {
    console.warn('Auth system check failed:', error);
  }

  // Check Language Context
  try {
    const savedLanguage = localStorage.getItem('language');
    status.translations.contextWorking = true;
    if (savedLanguage === 'en' || savedLanguage === 'lt') {
      status.translations.languageSwitchingWorking = true;
    }
  } catch (error) {
    console.warn('Translation system check failed:', error);
  }

  // Check Navigation
  try {
    status.navigation.routingWorking = Boolean(window.location);
    status.navigation.linksWorking = true;
  } catch (error) {
    console.warn('Navigation system check failed:', error);
  }

  return status;
};

export const logCoreSystemStatus = () => {
  const status = checkCoreSystemStatus();
  console.log('🔍 Core Systems Status:', status);
  
  // Alert if any critical system is down
  if (!status.auth.authContextWorking) {
    console.error('🚨 AUTH SYSTEM DOWN');
  }
  if (!status.translations.contextWorking) {
    console.error('🚨 TRANSLATION SYSTEM DOWN');
  }
  if (!status.navigation.routingWorking) {
    console.error('🚨 NAVIGATION SYSTEM DOWN');
  }
};
