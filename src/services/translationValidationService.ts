
import { translations } from '@/translations';
import { enTranslations } from '@/translations/en';
import { ltTranslations } from '@/translations/lt';

interface TranslationValidationResult {
  missingKeys: string[];
  unusedKeys: string[];
  invalidInterpolations: string[];
  lengthWarnings: string[];
  passed: boolean;
  coverage: number;
}

interface ComponentValidationResult {
  component: string;
  issues: string[];
  status: 'passed' | 'failed' | 'warning';
}

class TranslationValidationService {
  private testingMode = false;

  // Phase 1: Translation Coverage Audit
  async validateTranslationCoverage(): Promise<TranslationValidationResult> {
    console.log('Running translation coverage validation...');
    
    const enKeys = Object.keys(enTranslations);
    const ltKeys = Object.keys(ltTranslations);
    
    const missingKeys = enKeys.filter(key => !ltKeys.includes(key));
    const unusedKeys = ltKeys.filter(key => !enKeys.includes(key));
    const invalidInterpolations = this.validateInterpolations();
    const lengthWarnings = this.checkTextLengthWarnings();
    
    const coverage = ((enKeys.length - missingKeys.length) / enKeys.length) * 100;
    const passed = missingKeys.length === 0 && invalidInterpolations.length === 0;
    
    return {
      missingKeys,
      unusedKeys,
      invalidInterpolations,
      lengthWarnings,
      passed,
      coverage: Math.round(coverage)
    };
  }

  private validateInterpolations(): string[] {
    const issues: string[] = [];
    
    Object.keys(enTranslations).forEach(key => {
      const enText = enTranslations[key];
      const ltText = ltTranslations[key];
      
      if (enText && ltText) {
        const enParams = enText.match(/\{[^}]+\}/g) || [];
        const ltParams = ltText.match(/\{[^}]+\}/g) || [];
        
        if (enParams.length !== ltParams.length) {
          issues.push(`${key}: Parameter mismatch - EN: ${enParams.length}, LT: ${ltParams.length}`);
        }
        
        enParams.forEach(param => {
          if (!ltParams.includes(param)) {
            issues.push(`${key}: Missing parameter ${param} in Lithuanian`);
          }
        });
      }
    });
    
    return issues;
  }

  private checkTextLengthWarnings(): string[] {
    const warnings: string[] = [];
    const lengthThreshold = 1.5; // Lithuanian text 50% longer than English
    
    Object.keys(enTranslations).forEach(key => {
      const enText = enTranslations[key];
      const ltText = ltTranslations[key];
      
      if (enText && ltText) {
        if (ltText.length > enText.length * lengthThreshold) {
          warnings.push(`${key}: Lithuanian text significantly longer (${ltText.length} vs ${enText.length} chars)`);
        }
      }
    });
    
    return warnings;
  }

  // Phase 2: Component Validation
  async validateComponentTranslations(): Promise<ComponentValidationResult[]> {
    console.log('Validating component translations...');
    
    // Simulated component validation - in real implementation, this would scan actual components
    const criticalComponents = [
      'AuthHeader', 'DashboardHeader', 'LanguageSwitcher', 'StudentLoginForm', 
      'TeacherLoginForm', 'FeedbackForm', 'WeeklySummary', 'MentalHealthSupport'
    ];
    
    return criticalComponents.map(component => {
      const issues = this.validateComponentKeys(component);
      return {
        component,
        issues,
        status: issues.length === 0 ? 'passed' : issues.some(i => i.includes('critical')) ? 'failed' : 'warning'
      };
    });
  }

  private validateComponentKeys(component: string): string[] {
    const issues: string[] = [];
    
    // Simulate component-specific validation logic
    switch (component) {
      case 'AuthHeader':
        if (!ltTranslations['navigation.backToHome']) {
          issues.push('Missing back to home translation');
        }
        break;
      case 'LanguageSwitcher':
        // This component has hardcoded flags and labels, which is actually correct
        break;
      case 'StudentLoginForm':
        const authKeys = ['auth.login', 'auth.email', 'auth.password'];
        authKeys.forEach(key => {
          if (!ltTranslations[key]) {
            issues.push(`Missing critical auth translation: ${key}`);
          }
        });
        break;
      default:
        // Generic validation
        break;
    }
    
    return issues;
  }

  // Phase 3: Runtime Stability Testing
  async testRuntimeStability(): Promise<{ passed: boolean; errors: string[] }> {
    console.log('Testing translation runtime stability...');
    
    const errors: string[] = [];
    
    try {
      // Test translation function with various scenarios
      this.testTranslationFunction(errors);
      this.testLanguageSwitching(errors);
      this.testParameterInterpolation(errors);
      this.testMissingKeyHandling(errors);
      
      return {
        passed: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Runtime test failed: ${error.message}`);
      return { passed: false, errors };
    }
  }

  private testTranslationFunction(errors: string[]): void {
    try {
      // Test basic translation
      const mockT = (key: string) => ltTranslations[key] || enTranslations[key] || key;
      
      const testKeys = ['common.loading', 'auth.login', 'dashboard.welcome'];
      testKeys.forEach(key => {
        const result = mockT(key);
        if (!result || result === key) {
          errors.push(`Translation function failed for key: ${key}`);
        }
      });
    } catch (error) {
      errors.push(`Translation function error: ${error.message}`);
    }
  }

  private testLanguageSwitching(errors: string[]): void {
    try {
      // Simulate language switching
      let currentLang: 'en' | 'lt' = 'en';
      
      // Test switching to Lithuanian
      currentLang = 'lt';
      const ltResult = translations[currentLang]['common.loading'];
      if (!ltResult) {
        errors.push('Language switching to Lithuanian failed');
      }
      
      // Test switching back to English
      currentLang = 'en';
      const enResult = translations[currentLang]['common.loading'];
      if (!enResult) {
        errors.push('Language switching to English failed');
      }
    } catch (error) {
      errors.push(`Language switching error: ${error.message}`);
    }
  }

  private testParameterInterpolation(errors: string[]): void {
    try {
      // Test parameter interpolation
      const testText = ltTranslations['dashboard.scheduledClasses'] || '';
      if (testText && testText.includes('{grade}') && testText.includes('{school}')) {
        // Simulate parameter replacement
        const result = testText.replace('{grade}', '10A').replace('{school}', 'Test School');
        if (result === testText) {
          errors.push('Parameter interpolation not working correctly');
        }
      }
    } catch (error) {
      errors.push(`Parameter interpolation error: ${error.message}`);
    }
  }

  private testMissingKeyHandling(errors: string[]): void {
    try {
      // Test handling of missing keys
      const mockT = (key: string) => {
        const result = ltTranslations[key] || enTranslations[key] || key;
        return result;
      };
      
      const missingKey = 'non.existent.key';
      const result = mockT(missingKey);
      
      // Should fallback gracefully, not crash
      if (typeof result !== 'string') {
        errors.push('Missing key handling not working correctly');
      }
    } catch (error) {
      errors.push(`Missing key handling error: ${error.message}`);
    }
  }

  // Phase 4: UI Layout Testing
  async testUICompatibility(): Promise<{ passed: boolean; issues: string[] }> {
    console.log('Testing UI compatibility with Lithuanian translations...');
    
    const issues: string[] = [];
    
    // Test critical UI elements that might break with longer text
    const criticalUITests = [
      this.testButtonSizing(),
      this.testNavigationLayout(),
      this.testFormLabels(),
      this.testMobileLayout()
    ];
    
    criticalUITests.flat().forEach(issue => {
      if (issue) issues.push(issue);
    });
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  private testButtonSizing(): string[] {
    const issues: string[] = [];
    
    // Test buttons with Lithuanian text
    const buttonTexts = [
      ltTranslations['common.submit'] || '',
      ltTranslations['auth.login'] || '',
      ltTranslations['common.cancel'] || ''
    ];
    
    buttonTexts.forEach((text, index) => {
      if (text.length > 20) {
        issues.push(`Button text too long for mobile: "${text}" (${text.length} chars)`);
      }
    });
    
    return issues;
  }

  private testNavigationLayout(): string[] {
    const issues: string[] = [];
    
    // Test navigation items
    const navTexts = [
      ltTranslations['nav.dashboard'] || '',
      ltTranslations['navigation.studentLogin'] || '',
      ltTranslations['navigation.teacherLogin'] || ''
    ];
    
    navTexts.forEach(text => {
      if (text.length > 25) {
        issues.push(`Navigation text might overflow: "${text}"`);
      }
    });
    
    return issues;
  }

  private testFormLabels(): string[] {
    const issues: string[] = [];
    
    // Test form labels
    const formLabels = [
      ltTranslations['auth.email'] || '',
      ltTranslations['auth.password'] || '',
      ltTranslations['student.school'] || ''
    ];
    
    formLabels.forEach(label => {
      if (label.length > 30) {
        issues.push(`Form label might cause layout issues: "${label}"`);
      }
    });
    
    return issues;
  }

  private testMobileLayout(): string[] {
    const issues: string[] = [];
    
    // Test mobile-critical translations
    const mobileTexts = [
      ltTranslations['common.back'] || '',
      ltTranslations['common.next'] || '',
      ltTranslations['logout'] || ''
    ];
    
    mobileTexts.forEach(text => {
      if (text.length > 15) {
        issues.push(`Mobile text might be too long: "${text}"`);
      }
    });
    
    return issues;
  }

  // Comprehensive Test Suite
  async runComprehensiveValidation(): Promise<{
    passed: boolean;
    coverage: TranslationValidationResult;
    components: ComponentValidationResult[];
    runtime: { passed: boolean; errors: string[] };
    ui: { passed: boolean; issues: string[] };
    summary: string;
  }> {
    console.log('Running comprehensive Lithuanian translation validation...');
    
    const coverage = await this.validateTranslationCoverage();
    const components = await this.validateComponentTranslations();
    const runtime = await this.testRuntimeStability();
    const ui = await this.testUICompatibility();
    
    const allPassed = coverage.passed && 
                     components.every(c => c.status !== 'failed') && 
                     runtime.passed && 
                     ui.passed;
    
    const summary = this.generateSummary(coverage, components, runtime, ui, allPassed);
    
    return {
      passed: allPassed,
      coverage,
      components,
      runtime,
      ui,
      summary
    };
  }

  private generateSummary(
    coverage: TranslationValidationResult,
    components: ComponentValidationResult[],
    runtime: { passed: boolean; errors: string[] },
    ui: { passed: boolean; issues: string[] },
    allPassed: boolean
  ): string {
    const failedComponents = components.filter(c => c.status === 'failed').length;
    const warningComponents = components.filter(c => c.status === 'warning').length;
    
    let summary = `Lithuanian Translation Validation ${allPassed ? 'PASSED' : 'NEEDS ATTENTION'}\n\n`;
    summary += `Coverage: ${coverage.coverage}% (${coverage.missingKeys.length} missing keys)\n`;
    summary += `Components: ${components.length - failedComponents - warningComponents} passed, ${warningComponents} warnings, ${failedComponents} failed\n`;
    summary += `Runtime: ${runtime.passed ? 'STABLE' : `${runtime.errors.length} errors`}\n`;
    summary += `UI Layout: ${ui.passed ? 'COMPATIBLE' : `${ui.issues.length} issues`}\n`;
    
    if (!allPassed) {
      summary += '\nImmediate actions needed:\n';
      if (coverage.missingKeys.length > 0) {
        summary += `- Add ${coverage.missingKeys.length} missing translation keys\n`;
      }
      if (failedComponents > 0) {
        summary += `- Fix ${failedComponents} critical component issues\n`;
      }
      if (!runtime.passed) {
        summary += `- Resolve ${runtime.errors.length} runtime stability issues\n`;
      }
      if (!ui.passed) {
        summary += `- Address ${ui.issues.length} UI layout issues\n`;
      }
    }
    
    return summary;
  }

  // Testing utilities
  enableTestingMode(): void {
    this.testingMode = true;
    console.log('Translation validation testing mode enabled');
  }

  disableTestingMode(): void {
    this.testingMode = false;
    console.log('Translation validation testing mode disabled');
  }

  // Quick health check
  async quickHealthCheck(): Promise<{ healthy: boolean; criticalIssues: string[] }> {
    const criticalIssues: string[] = [];
    
    // Check if basic translations exist
    const criticalKeys = [
      'common.loading', 'auth.login', 'dashboard.welcome', 
      'logout', 'common.error', 'common.success'
    ];
    
    criticalKeys.forEach(key => {
      if (!ltTranslations[key]) {
        criticalIssues.push(`Critical translation missing: ${key}`);
      }
    });
    
    // Check if language context works
    try {
      const testTranslation = translations.lt['common.loading'];
      if (!testTranslation) {
        criticalIssues.push('Language context not working properly');
      }
    } catch (error) {
      criticalIssues.push('Translation system runtime error');
    }
    
    return {
      healthy: criticalIssues.length === 0,
      criticalIssues
    };
  }
}

export const translationValidationService = new TranslationValidationService();
