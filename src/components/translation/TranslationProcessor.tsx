import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Download, Play, RefreshCw } from 'lucide-react';
import { TranslationAuditService } from '@/services/translationAuditService';
import { DeepLTranslationService, TranslationProgress, TranslationResult } from '@/services/deeplTranslationService';

/**
 * PHASE 2 COMPONENT - Translation Processing with DeepL Integration
 * This component handles the actual translation of missing keys
 */
const TranslationProcessor: React.FC = () => {
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
  const [connectionTest, setConnectionTest] = useState<{ tested: boolean; success: boolean; error?: string }>({
    tested: false,
    success: false
  });

  const handleTestConnection = async () => {
    console.log('🔍 Testing DeepL connection...');
    
    const testResult = await DeepLTranslationService.testConnection();
    setConnectionTest({
      tested: true,
      success: testResult.success,
      error: testResult.error
    });
  };

  const handleStartTranslation = async () => {
    console.log('🚀 Starting translation process...');
    
    try {
      // Get missing keys from audit service
      const missingKeys = TranslationAuditService.getPrioritizedMissingKeys();
      
      if (missingKeys.length === 0) {
        console.log('✅ No missing keys to translate');
        return;
      }

      console.log(`📋 Found ${missingKeys.length} missing keys to translate`);
      
      // Start translation with progress tracking
      const translationResults = await DeepLTranslationService.translateMissingKeys(
        missingKeys,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );
      
      setResults(translationResults);
      console.log(`✅ Translation completed with ${translationResults.length} results`);
      
    } catch (error) {
      console.error('❌ Translation process failed:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        errors: [...prev.errors, error instanceof Error ? error.message : 'Translation failed']
      }));
    }
  };

  const handleDownloadResults = () => {
    if (results.length === 0) return;

    // Generate Lithuanian translations object
    const ltTranslations: Record<string, string> = {};
    results.forEach(result => {
      ltTranslations[result.key] = result.translatedText;
    });

    // Create downloadable file
    const content = `// Generated Lithuanian translations from DeepL\n// Generated at: ${new Date().toISOString()}\n\nexport const additionalLtTranslations = ${JSON.stringify(ltTranslations, null, 2)};`;
    
    const blob = new Blob([content], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithuanian-translations-${Date.now()}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isTranslating = progress.status === 'translating';
  const hasResults = results.length > 0;
  const hasErrors = progress.errors.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-teal" />
            DeepL Translation Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestConnection}
                disabled={isTranslating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Test DeepL Connection
              </Button>
              
              {connectionTest.tested && (
                <Badge variant={connectionTest.success ? "default" : "destructive"}>
                  {connectionTest.success ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </>
                  )}
                </Badge>
              )}
            </div>
            
            {connectionTest.tested && !connectionTest.success && connectionTest.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{connectionTest.error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Translation Controls */}
          <div className="space-y-4">
            <Button 
              onClick={handleStartTranslation}
              disabled={isTranslating || !connectionTest.success}
              className="w-full"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Translation
                </>
              )}
            </Button>

            {/* Progress */}
            {progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {progress.completed}/{progress.total}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="w-full" />
                <div className="text-xs text-gray-600">
                  Batch {progress.currentBatch}/{progress.totalBatches}
                </div>
              </div>
            )}

            {/* Status */}
            {progress.status !== 'idle' && (
              <div className="flex items-center gap-2">
                <Badge variant={
                  progress.status === 'completed' ? 'default' :
                  progress.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {progress.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {progress.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                </Badge>
              </div>
            )}

            {/* Errors */}
            {hasErrors && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Translation Errors:</div>
                    {progress.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-sm">{error}</div>
                    ))}
                    {progress.errors.length > 3 && (
                      <div className="text-sm">...and {progress.errors.length - 3} more errors</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {hasResults && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Translation Results: {results.length} keys translated
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadResults}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="text-xs text-gray-600">
                  Results will be downloaded as a TypeScript file that can be integrated into your translations.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Translation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.slice(0, 10).map((result, index) => (
                <div key={index} className="border-l-2 border-brand-teal pl-3 py-1">
                  <div className="text-xs text-gray-500">{result.key}</div>
                  <div className="text-sm text-gray-700">{result.originalText}</div>
                  <div className="text-sm font-medium">{result.translatedText}</div>
                </div>
              ))}
              {results.length > 10 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  ...and {results.length - 10} more translations
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationProcessor;