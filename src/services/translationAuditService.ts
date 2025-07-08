import { enTranslations } from '@/translations/en';
import { ltTranslations } from '@/translations/lt';

export interface TranslationGap {
  key: string;
  englishValue: string;
  category: string;
}

export interface TranslationAuditReport {
  totalEnglishKeys: number;
  totalLithuanianKeys: number;
  missingLithuanianKeys: TranslationGap[];
  coveragePercentage: number;
}

export class TranslationAuditService {
  /**
   * Core Phase 1: Audit missing Lithuanian translations
   * This doesn't modify anything - just analyzes the gap
   */
  static generateAuditReport(): TranslationAuditReport {
    const englishKeys = Object.keys(enTranslations);
    const lithuanianKeys = Object.keys(ltTranslations);
    
    // Find missing Lithuanian keys
    const missingKeys: TranslationGap[] = englishKeys
      .filter(key => !lithuanianKeys.includes(key))
      .map(key => ({
        key,
        englishValue: enTranslations[key as keyof typeof enTranslations],
        category: this.categorizeKey(key)
      }));

    const coveragePercentage = Math.round(
      ((englishKeys.length - missingKeys.length) / englishKeys.length) * 100
    );

    return {
      totalEnglishKeys: englishKeys.length,
      totalLithuanianKeys: lithuanianKeys.length,
      missingLithuanianKeys: missingKeys,
      coveragePercentage
    };
  }

  /**
   * Categorize translation keys by their purpose
   */
  private static categorizeKey(key: string): string {
    if (key.startsWith('common.')) return 'Common UI';
    if (key.startsWith('nav.') || key.startsWith('navigation.')) return 'Navigation';
    if (key.startsWith('auth.')) return 'Authentication';
    if (key.startsWith('dashboard.')) return 'Dashboard';
    if (key.startsWith('feedback.')) return 'Feedback System';
    if (key.startsWith('weeklySummary.')) return 'Weekly Summary';
    if (key.startsWith('teacher.')) return 'Teacher Interface';
    if (key.startsWith('student.')) return 'Student Interface';
    if (key.startsWith('admin.')) return 'Admin Interface';
    if (key.startsWith('mentalHealth.')) return 'Mental Health';
    if (key.startsWith('ai.')) return 'AI Features';
    if (key.startsWith('pricing.')) return 'Pricing';
    if (key.startsWith('schedule.')) return 'Class Scheduling';
    if (key.startsWith('upload.')) return 'File Upload';
    if (key.startsWith('notes.')) return 'Teacher Notes';
    if (key.startsWith('wellness.')) return 'Wellness Tracking';
    if (key.startsWith('chat.')) return 'Chat System';
    if (key.startsWith('demo.')) return 'Demo Content';
    return 'Other';
  }

  /**
   * Generate summary report for console output
   */
  static logAuditSummary(): void {
    const report = this.generateAuditReport();
    
    console.log('=== TRANSLATION AUDIT REPORT ===');
    console.log(`Lithuanian Coverage: ${report.coveragePercentage}%`);
    console.log(`Missing Keys: ${report.missingLithuanianKeys.length}/${report.totalEnglishKeys}`);
    
    // Group by category
    const byCategory = report.missingLithuanianKeys.reduce((acc, gap) => {
      if (!acc[gap.category]) acc[gap.category] = 0;
      acc[gap.category]++;
      return acc;
    }, {} as Record<string, number>);

    console.log('\nMissing keys by category:');
    Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} keys`);
      });
  }

  /**
   * Phase 2 preparation: Get prioritized keys for DeepL translation
   * Returns keys sorted by importance (core functionality first)
   */
  static getPrioritizedMissingKeys(): TranslationGap[] {
    const report = this.generateAuditReport();
    
    const priorityOrder = [
      'Common UI',
      'Navigation', 
      'Authentication',
      'Dashboard',
      'Student Interface',
      'Teacher Interface',
      'Feedback System',
      'Mental Health',
      'Weekly Summary',
      'Admin Interface',
      'Other'
    ];

    return report.missingLithuanianKeys.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.category);
      const bPriority = priorityOrder.indexOf(b.category);
      return aPriority - bPriority;
    });
  }
}