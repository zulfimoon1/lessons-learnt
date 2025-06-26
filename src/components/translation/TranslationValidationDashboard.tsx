
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  PlayCircle, 
  Loader2, 
  Languages,
  FileText,
  Monitor,
  Smartphone
} from 'lucide-react';
import { translationValidationService } from '@/services/translationValidationService';
import { toast } from '@/hooks/use-toast';

interface ValidationResults {
  passed: boolean;
  coverage: any;
  components: any[];
  runtime: { passed: boolean; errors: string[] };
  ui: { passed: boolean; issues: string[] };
  summary: string;
}

const TranslationValidationDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResults | null>(null);
  const [healthCheck, setHealthCheck] = useState<{ healthy: boolean; criticalIssues: string[] } | null>(null);

  useEffect(() => {
    performQuickHealthCheck();
  }, []);

  const performQuickHealthCheck = async () => {
    try {
      const health = await translationValidationService.quickHealthCheck();
      setHealthCheck(health);
      
      if (!health.healthy) {
        toast({
          title: 'Translation Health Issues Detected',
          description: `${health.criticalIssues.length} critical issues found`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const runComprehensiveValidation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      toast({
        title: 'Running Translation Validation',
        description: 'Testing Lithuanian translations comprehensively...'
      });

      const validationResults = await translationValidationService.runComprehensiveValidation();
      
      setResults(validationResults);

      toast({
        title: validationResults.passed ? 'All Tests Passed' : 'Issues Detected',
        description: validationResults.passed 
          ? 'Lithuanian translations are fully compatible' 
          : 'Some issues need attention',
        variant: validationResults.passed ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Validation failed:', error);
      
      toast({
        title: 'Validation Error',
        description: 'Failed to run translation validation',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getComponentStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="w-8 h-8 text-blue-600" />
            Lithuanian Translation Validation
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing and validation of Lithuanian translations
          </p>
        </div>
        <Button 
          onClick={runComprehensiveValidation} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Validation...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Run Full Validation
            </>
          )}
        </Button>
      </div>

      {/* Health Check Alert */}
      {healthCheck && !healthCheck.healthy && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Translation Issues:</strong>
            <ul className="mt-2 list-disc list-inside">
              {healthCheck.criticalIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Results */}
      {results && (
        <Alert className={results.passed ? 'border-green-200' : 'border-red-200'}>
          {results.passed ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <strong>Validation {results.passed ? 'PASSED' : 'FAILED'}:</strong>
            <pre className="mt-2 text-sm whitespace-pre-wrap font-mono">
              {results.summary}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Results */}
      {results && (
        <Tabs defaultValue="coverage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
            <TabsTrigger value="components">Component Testing</TabsTrigger>
            <TabsTrigger value="runtime">Runtime Stability</TabsTrigger>
            <TabsTrigger value="ui">UI Compatibility</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Translation Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Coverage</span>
                      <span className="text-sm text-muted-foreground">
                        {results.coverage.coverage}%
                      </span>
                    </div>
                    <Progress value={results.coverage.coverage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {results.coverage.missingKeys.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Missing Keys</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {results.coverage.unusedKeys.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Unused Keys</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {results.coverage.invalidInterpolations.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Invalid Params</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {results.coverage.lengthWarnings.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Length Warnings</div>
                    </div>
                  </div>

                  {results.coverage.missingKeys.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Missing Translation Keys:</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {results.coverage.missingKeys.map((key: string, index: number) => (
                          <div key={index} className="text-sm font-mono bg-red-50 p-2 rounded">
                            {key}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.coverage.invalidInterpolations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">Parameter Issues:</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {results.coverage.invalidInterpolations.map((issue: string, index: number) => (
                          <div key={index} className="text-sm bg-yellow-50 p-2 rounded">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Component Translation Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.components.map((component: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getComponentStatusIcon(component.status)}
                        <div>
                          <div className="font-medium">{component.component}</div>
                          {component.issues.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {component.issues.length} issue(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm capitalize px-2 py-1 rounded ${
                        component.status === 'passed' ? 'bg-green-100 text-green-700' :
                        component.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {component.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(results.runtime.passed)}
                  Runtime Stability Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.runtime.passed ? (
                  <div className="text-green-600 font-medium">
                    ✅ All runtime stability tests passed
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-600 font-medium mb-3">
                      Runtime Issues Detected:
                    </div>
                    {results.runtime.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-200">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ui" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  UI Layout Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.ui.passed ? (
                  <div className="text-green-600 font-medium">
                    ✅ All UI compatibility tests passed
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-orange-600 font-medium mb-3">
                      UI Layout Issues:
                    </div>
                    {results.ui.issues.map((issue: string, index: number) => (
                      <div key={index} className="text-sm bg-orange-50 p-2 rounded border-l-2 border-orange-200">
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={performQuickHealthCheck}>
              Quick Health Check
            </Button>
            <Button variant="outline" onClick={() => translationValidationService.enableTestingMode()}>
              Enable Testing Mode
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Test Language Switch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationValidationDashboard;
