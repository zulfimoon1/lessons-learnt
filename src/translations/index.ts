
import { enTranslations } from './en';
import { ltTranslations } from './lt';

export const translations = {
  en: enTranslations,
  lt: ltTranslations,
};

export type Language = 'en' | 'lt';
export type TranslationKey = keyof typeof enTranslations;
