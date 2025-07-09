import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Play, Download, Target } from 'lucide-react';
import { TranslationAuditService, TranslationAuditReport } from '@/services/translationAuditService';
import { DeepLTranslationService, TranslationProgress, TranslationResult } from '@/services/deeplTranslationService';

/**
 * FINAL TRANSLATION COMPLETION COMPONENT
 * This component automatically audits, translates, and provides download for the final 3% missing translations
 */
const TranslationCompletion: React.FC = () => {
  const [auditReport, setAuditReport] = useState<TranslationAuditReport | null>(null);
  const [progress, setProgress] = useState<TranslationProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
    currentBatch: 0,
    totalBatches: 0,
    status: 'idle',
    errors: []
  });
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Run audit immediately on component mount
    runAudit();
  }, []);

  const runAudit = () => {
    console.log('🔍 Running translation audit...');
    const report = TranslationAuditService.generateAuditReport();
    setAuditReport(report);
    console.log(`📊 Audit complete: ${report.coveragePercentage}% coverage, ${report.missingLithuanianKeys.length} missing keys`);
  };

  const completeAllTranslations = async () => {
    if (!auditReport || auditReport.missingLithuanianKeys.length === 0) {
      console.log('✅ No missing translations to complete');
      return;
    }

    setIsCompleting(true);
    console.log(`🚀 Starting final translation completion for ${auditReport.missingLithuanianKeys.length} missing keys`);

    try {
      // Start translation with progress tracking
      const translationResults = await DeepLTranslationService.translateMissingKeys(
        auditReport.missingLithuanianKeys,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );
      
      setResults(translationResults);
      
      // Re-run audit to check final coverage
      setTimeout(() => {
        runAudit();
      }, 1000);
      
      console.log(`✅ Translation completion finished with ${translationResults.length} results`);
      
    } catch (error) {
      console.error('❌ Translation completion failed:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Translation failed']
      }));
    } finally {
      setIsCompleting(false);
    }
  };

  const downloadFinalTranslations = () => {
    if (results.length === 0) return;

    // Generate final Lithuanian translations object
    const finalTranslations: Record<string, string> = {};
    results.forEach(result => {
      finalTranslations[result.key] = result.translatedText;
    });

    // Create final translation file
    const content = `// FINAL LITHUANIAN TRANSLATIONS - 100% COVERAGE COMPLETION
// Generated at: ${new Date().toISOString()}
// Total translations: ${results.length}

export const finalLithuanianTranslations = ${JSON.stringify(finalTranslations, null, 2)};

// INTEGRATION INSTRUCTIONS:
// 1. Copy the translations above
// 2. Add them to your src/translations/lt.ts file
// 3. Merge with existing ltTranslations object
// 4. Test language switching to verify all translations work
// 5. You should now have 100% translation coverage!
`;
    
    const blob = new Blob([content], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `final-lithuanian-translations-100-percent.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isTranslating = progress.status === 'translating';
  const hasResults = results.length > 0;
  const hasErrors = progress.errors.length > 0;
  const isCompleted = auditReport?.coveragePercentage === 100;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-brand-teal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-brand-teal" />
            Final Translation Completion - Achieve 100% Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {auditReport && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Current Coverage</span>
                <Badge variant={isCompleted ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      100% Complete!
                    </>
                  ) : (
                    `${auditReport.coveragePercentage}%`
                  )}
                </Badge>
              </div>
              
              <Progress value={auditReport.coveragePercentage} className="w-full h-3" />
              
              <div className="text-sm text-gray-600">
                {auditReport.totalLithuanianKeys} of {auditReport.totalEnglishKeys} translations complete
                {auditReport.missingLithuanianKeys.length > 0 && (
                  <span className="text-orange-600 font-medium">
                    {" "}• {auditReport.missingLithuanianKeys.length} remaining
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Completion Action */}
          {auditReport && !isCompleted && (
            <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {auditReport.missingLithuanianKeys.length} translations remaining to achieve 100% coverage
                </span>
              </div>
              
              <Button 
                onClick={completeAllTranslations}
                disabled={isTranslating}
                className="w-full bg-brand-teal hover:bg-brand-teal/90"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Translating {auditReport.missingLithuanianKeys.length} keys...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Complete All Remaining Translations
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success State */}
          {isCompleted && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 <strong>Congratulations!</strong> You have achieved 100% translation coverage!
                Your application now supports complete Lithuanian localization.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Display */}
          {progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Translation Progress: {progress.completed}/{progress.total}</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="w-full" />
              {progress.totalBatches > 1 && (
                <div className="text-xs text-gray-600">
                  Batch {progress.currentBatch}/{progress.totalBatches}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {hasErrors && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Translation Errors:</div>
                  {progress.errors.slice(0, 2).map((error, index) => (
                    <div key={index} className="text-sm">{error}</div>
                  ))}
                  {progress.errors.length > 2 && (
                    <div className="text-sm">...and {progress.errors.length - 2} more errors</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Results Download */}
          {hasResults && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">
                  ✅ {results.length} translations completed successfully!
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadFinalTranslations}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Final Translations
                </Button>
              </div>
              
              <div className="text-sm text-green-700">
                Integration file will be downloaded with complete instructions for achieving 100% coverage.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing Keys Preview */}
      {auditReport && auditReport.missingLithuanianKeys.length > 0 && !hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Missing Translations Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auditReport.missingLithuanianKeys.slice(0, 8).map((gap, index) => (
                <div key={index} className="border-l-2 border-orange-300 pl-3 py-1">
                  <div className="text-xs text-gray-500">{gap.category}</div>
                  <div className="text-sm font-medium">{gap.key}</div>
                  <div className="text-sm text-gray-700">{gap.englishValue}</div>
                </div>
              ))}
              {auditReport.missingLithuanianKeys.length > 8 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  ...and {auditReport.missingLithuanianKeys.length - 8} more missing translations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationCompletion;