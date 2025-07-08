import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Download, Upload, FileText } from 'lucide-react';

/**
 * PHASE 3 COMPONENT - Translation Integration Helper
 * This component helps integrate downloaded DeepL translations into the existing files
 */
const TranslationIntegrator: React.FC = () => {
  const [translationData, setTranslationData] = useState<string>('');
  const [parsedTranslations, setParsedTranslations] = useState<Record<string, string>>({});
  const [integrationResult, setIntegrationResult] = useState<{
    added: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const handleParseTranslations = () => {
    try {
      // Try to extract JSON from the pasted content
      const jsonMatch = translationData.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in the input');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      setParsedTranslations(parsed);
      console.log('✅ Successfully parsed translations:', Object.keys(parsed).length, 'keys');
    } catch (error) {
      console.error('❌ Failed to parse translations:', error);
      setIntegrationResult({
        added: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Failed to parse translations']
      });
    }
  };

  const handleIntegrate = () => {
    if (Object.keys(parsedTranslations).length === 0) {
      setIntegrationResult({
        added: 0,
        updated: 0,
        errors: ['No translations to integrate. Please parse translations first.']
      });
      return;
    }

    // Generate the updated translation files
    const result = generateUpdatedTranslationFiles(parsedTranslations);
    setIntegrationResult(result);
  };

  const generateUpdatedTranslationFiles = (newTranslations: Record<string, string>) => {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      // Categorize translations by their prefixes
      const categorizedTranslations = categorizeTranslations(newTranslations);
      
      added = Object.keys(newTranslations).length;
      
      // Create integration files for download
      createIntegrationFiles(categorizedTranslations);
      
      console.log(`📊 Integration summary: ${added} new translations categorized`);
      
      return { added, updated, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Integration failed');
      return { added: 0, updated: 0, errors };
    }
  };

  const categorizeTranslations = (translations: Record<string, string>) => {
    const categories = {
      main: {} as Record<string, string>,
      auth: {} as Record<string, string>,
      chat: {} as Record<string, string>,
      demo: {} as Record<string, string>,
      teacher: {} as Record<string, string>,
      weekly: {} as Record<string, string>,
      other: {} as Record<string, string>
    };

    Object.entries(translations).forEach(([key, value]) => {
      if (key.startsWith('auth.')) {
        categories.auth[key] = value;
      } else if (key.startsWith('chat.')) {
        categories.chat[key] = value;
      } else if (key.startsWith('demo.')) {
        categories.demo[key] = value;
      } else if (key.startsWith('teacher.')) {
        categories.teacher[key] = value;
      } else if (key.startsWith('weekly.')) {
        categories.weekly[key] = value;
      } else {
        categories.main[key] = value;
      }
    });

    return categories;
  };

  const createIntegrationFiles = (categorizedTranslations: any) => {
    // Create downloadable files for each category
    if (Object.keys(categorizedTranslations.main).length > 0) {
      downloadTranslationFile('lt-main-additions.ts', categorizedTranslations.main, 'ltTranslations');
    }
    
    if (Object.keys(categorizedTranslations.auth).length > 0) {
      downloadTranslationFile('lt-auth-additions.ts', categorizedTranslations.auth, 'auth');
    }
    
    if (Object.keys(categorizedTranslations.chat).length > 0) {
      downloadTranslationFile('lt-chat-additions.ts', categorizedTranslations.chat, 'ltChatTranslations');
    }
    
    if (Object.keys(categorizedTranslations.demo).length > 0) {
      downloadTranslationFile('lt-demo-additions.ts', categorizedTranslations.demo, 'ltDemoTranslations');
    }
    
    if (Object.keys(categorizedTranslations.teacher).length > 0) {
      downloadTranslationFile('lt-teacher-additions.ts', categorizedTranslations.teacher, 'teacher');
    }
    
    if (Object.keys(categorizedTranslations.weekly).length > 0) {
      downloadTranslationFile('lt-weekly-additions.ts', categorizedTranslations.weekly, 'weekly');
    }
  };

  const downloadTranslationFile = (filename: string, translations: Record<string, string>, exportName: string) => {
    const content = `// Additional Lithuanian translations from DeepL
// Generated at: ${new Date().toISOString()}
// Add these to your existing ${filename.split('-')[1]} translation file

export const additional${exportName.charAt(0).toUpperCase() + exportName.slice(1)} = ${JSON.stringify(translations, null, 2)};

// To integrate: merge these with your existing translations object`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTranslationData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-teal" />
            Translation Integration Helper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paste Downloaded Translation Content
            </label>
            <Textarea
              value={translationData}
              onChange={(e) => setTranslationData(e.target.value)}
              placeholder="Paste the content from your downloaded translation file here..."
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Or Upload File</label>
            <input
              type="file"
              accept=".ts,.js,.json,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-teal file:text-white hover:file:bg-brand-teal/80"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleParseTranslations}
              disabled={!translationData.trim()}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Parse Translations
            </Button>

            <Button 
              onClick={handleIntegrate}
              disabled={Object.keys(parsedTranslations).length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Integration Files
            </Button>
          </div>

          {Object.keys(parsedTranslations).length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully parsed {Object.keys(parsedTranslations).length} translations. 
                Ready for integration.
              </AlertDescription>
            </Alert>
          )}

          {integrationResult && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="default">
                  {integrationResult.added} new translations
                </Badge>
                {integrationResult.updated > 0 && (
                  <Badge variant="secondary">
                    {integrationResult.updated} updated
                  </Badge>
                )}
              </div>

              {integrationResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Integration Errors:</div>
                      {integrationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm">{error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {integrationResult.added > 0 && integrationResult.errors.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Integration files generated successfully! Check your downloads folder for the categorized translation files.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Parse & Generate</h4>
            <p>Paste your downloaded translation content and click "Parse Translations", then "Generate Integration Files".</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Download Files</h4>
            <p>The system will generate categorized files for each translation category (auth, chat, demo, etc.).</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Manual Integration</h4>
            <p>Open each generated file and copy the translations into your corresponding Lithuanian translation files.</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Test</h4>
            <p>Switch your app to Lithuanian to verify the new translations are working correctly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationIntegrator;