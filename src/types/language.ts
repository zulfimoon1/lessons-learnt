
export type Language = 'en' | 'lt';

export interface Translations {
  [key: string]: any;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
