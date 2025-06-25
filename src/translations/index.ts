
import { enTranslations } from './en';
import { ltTranslations } from './lt';

export const translations = {
  en: enTranslations,
  lt: ltTranslations,
} as const;

export type TranslationKey = keyof typeof enTranslations;
export type Language = keyof typeof translations;
