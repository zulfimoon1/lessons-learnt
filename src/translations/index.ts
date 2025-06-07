
import { Language, Translations } from '@/types/language';
import { enTranslations } from './en';
import { ltTranslations } from './lt';

export const translations: Record<Language, Translations> = {
  en: enTranslations,
  lt: ltTranslations
};
