import { supabase } from '@/integrations/supabase/client';
import { TranslationGap } from './translationAuditService';

export interface TranslationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'translating' | 'completed' | 'error';
  errors: string[];
}

export interface TranslationResult {
  key: string;
  originalText: string;
  translatedText: string;
  category: string;
}

export class DeepLTranslationService {
  private static readonly BATCH_SIZE = 50; // DeepL free tier limit
  private static readonly DELAY_BETWEEN_BATCHES = 1000; // 1 second delay

  /**
   * Translate missing keys using DeepL API with progress tracking
   */
  static async translateMissingKeys(
    missingKeys: TranslationGap[],
    onProgress?: (progress: TranslationProgress) => void
  ): Promise<TranslationResult[]> {
    console.log(`🚀 Starting translation of ${missingKeys.length} missing keys`);
    
    const results: TranslationResult[] = [];
    const errors: string[] = [];
    const batches = this.createBatches(missingKeys, this.BATCH_SIZE);
    
    // Initialize progress
    const progress: TranslationProgress = {
      completed: 0,
      total: missingKeys.length,
      percentage: 0,
      currentBatch: 0,
      totalBatches: batches.length,
      status: 'translating',
      errors: []
    };
    
    onProgress?.(progress);

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        progress.currentBatch = i + 1;
        progress.status = 'translating';
        onProgress?.(progress);

        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);

        try {
          const batchResults = await this.translateBatch(batch);
          results.push(...batchResults);
          
          progress.completed += batch.length;
          progress.percentage = Math.round((progress.completed / progress.total) * 100);
          onProgress?.(progress);

          // Delay between batches to respect rate limits
          if (i < batches.length - 1) {
            await this.delay(this.DELAY_BETWEEN_BATCHES);
          }

        } catch (error) {
          const errorMsg = `Batch ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
          
          // Continue with next batch on error
          progress.completed += batch.length;
          progress.percentage = Math.round((progress.completed / progress.total) * 100);
        }
      }

      progress.status = errors.length > 0 ? 'error' : 'completed';
      progress.errors = errors;
      onProgress?.(progress);

      console.log(`✅ Translation completed: ${results.length} successful, ${errors.length} errors`);
      return results;

    } catch (error) {
      console.error('💥 Translation service error:', error);
      progress.status = 'error';
      progress.errors = [error instanceof Error ? error.message : 'Translation service failed'];
      onProgress?.(progress);
      throw error;
    }
  }

  /**
   * Translate a single batch of keys
   */
  private static async translateBatch(batch: TranslationGap[]): Promise<TranslationResult[]> {
    const texts = batch.map(gap => gap.englishValue);
    
    console.log(`🔄 Translating batch of ${texts.length} texts`);

    const { data, error } = await supabase.functions.invoke('translate-with-deepl', {
      body: {
        texts,
        targetLanguage: 'LT',
        sourceLanguage: 'EN'
      }
    });

    if (error) {
      console.error('DeepL edge function error:', error);
      throw new Error(`Translation API error: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Translation failed');
    }

    if (!data.translations || data.translations.length !== texts.length) {
      throw new Error(`Expected ${texts.length} translations, got ${data.translations?.length || 0}`);
    }

    // Combine results
    return batch.map((gap, index) => ({
      key: gap.key,
      originalText: gap.englishValue,
      translatedText: data.translations[index],
      category: gap.category
    }));
  }

  /**
   * Generate updated Lithuanian translation file content
   */
  static generateUpdatedTranslations(
    existingTranslations: Record<string, any>,
    newTranslations: TranslationResult[]
  ): Record<string, any> {
    const updated = { ...existingTranslations };
    
    // Add new translations
    newTranslations.forEach(result => {
      updated[result.key] = result.translatedText;
    });

    console.log(`📝 Generated updated translations with ${newTranslations.length} new entries`);
    return updated;
  }

  /**
   * Create batches from array
   */
  private static createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test DeepL API connectivity
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testing DeepL API connection...');
      
      const { data, error } = await supabase.functions.invoke('translate-with-deepl', {
        body: {
          texts: ['Hello, world!'],
          targetLanguage: 'LT',
          sourceLanguage: 'EN'
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || !data.success) {
        return { success: false, error: data?.error || 'Test translation failed' };
      }

      console.log('✅ DeepL API connection test successful');
      return { success: true };

    } catch (error) {
      console.error('❌ DeepL connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}