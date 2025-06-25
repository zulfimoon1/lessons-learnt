
import { en } from './en';
import { lt } from './lt';

export const translations = {
  en,
  lt,
} as const;

export type TranslationKey = keyof typeof en;
export type Language = keyof typeof translations;
