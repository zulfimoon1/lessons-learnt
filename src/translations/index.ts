
import { en } from './en';
import { lt } from './lt';

export const translations = {
  en: en,
  lt: lt,
} as const;

export type TranslationKey = keyof typeof en;
export type Language = keyof typeof translations;
