
import { useState, useCallback } from 'react';
import { multiLanguageDistressService, DistressAnalysis } from '@/services/multiLanguageDistressService';

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  expectedLanguage: 'en' | 'lt' | 'unknown';
  description: string;
}

interface TestResult {
  testCase: TestCase;
  result: DistressAnalysis;
  passed: boolean;
  accuracy: number;
  issues: string[];
}

export const useDistressDetectionTesting = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testCases: TestCase[] = [
    // English test cases
    {
      id: 'en-critical-1',
      name: 'English Critical - Suicide',
      input: 'I want to kill myself and end everything. There is no point in living anymore.',
      expectedRiskLevel: 'critical',
      expectedLanguage: 'en',
      description: 'Direct suicidal ideation should trigger critical alert'
    },
    {
      id: 'en-high-1',
      name: 'English High - Hopelessness',
      input: 'I feel hopeless and worthless. Nothing I do matters and I hate myself.',
      expectedRiskLevel: 'high',
      expectedLanguage: 'en',
      description: 'Strong negative self-talk should trigger high alert'
    },
    {
      id: 'en-medium-1',
      name: 'English Medium - Academic Stress',
      input: 'I am struggling with my studies and feel overwhelmed by everything.',
      expectedRiskLevel: 'medium',
      expectedLanguage: 'en',
      description: 'Academic stress should trigger medium alert'
    },
    {
      id: 'en-low-1',
      name: 'English Low - Positive',
      input: 'Today was a great day! I learned a lot and enjoyed the lesson.',
      expectedRiskLevel: 'low',
      expectedLanguage: 'en',
      description: 'Positive feedback should have low risk'
    },

    // Lithuanian test cases
    {
      id: 'lt-critical-1',
      name: 'Lithuanian Critical - Suicide',
      input: 'Noriu nusižudyti ir baigti viską. Nėra prasmės gyventi.',
      expectedRiskLevel: 'critical',
      expectedLanguage: 'lt',
      description: 'Direct suicidal ideation in Lithuanian should trigger critical alert'
    },
    {
      id: 'lt-high-1',
      name: 'Lithuanian High - Depression',
      input: 'Jaučiuosi beviltiškai ir nekenčiu savęs. Esu bevertas ir niekas nesiseka.',
      expectedRiskLevel: 'high',
      expectedLanguage: 'lt',
      description: 'Depression indicators in Lithuanian should trigger high alert'
    },
    {
      id: 'lt-medium-1',
      name: 'Lithuanian Medium - Academic',
      input: 'Sunku su mokslais, negaliu susidoroti su namų darbais.',
      expectedRiskLevel: 'medium',
      expectedLanguage: 'lt',
      description: 'Academic difficulties in Lithuanian should trigger medium alert'
    },
    {
      id: 'lt-low-1',
      name: 'Lithuanian Low - Positive',
      input: 'Šiandien buvo puiki diena! Daug išmokau ir pamoka buvo įdomi.',
      expectedRiskLevel: 'low',
      expectedLanguage: 'lt',
      description: 'Positive feedback in Lithuanian should have low risk'
    }
  ];

  const runTestCase = useCallback((testCase: TestCase): TestResult => {
    const result = multiLanguageDistressService.analyzeText(testCase.input);
    
    const issues: string[] = [];
    let accuracy = 100;

    // Check risk level
    if (result.riskLevel !== testCase.expectedRiskLevel) {
      issues.push(`Expected risk level ${testCase.expectedRiskLevel}, got ${result.riskLevel}`);
      accuracy -= 40;
    }

    // Check language detection
    if (result.detectedLanguage !== testCase.expectedLanguage) {
      issues.push(`Expected language ${testCase.expectedLanguage}, got ${result.detectedLanguage}`);
      accuracy -= 30;
    }

    // Check confidence level (should be > 0.3 for valid detections)
    if (result.confidence < 0.3 && testCase.expectedRiskLevel !== 'low') {
      issues.push(`Low confidence (${result.confidence}) for expected ${testCase.expectedRiskLevel} risk`);
      accuracy -= 20;
    }

    // Check for appropriate indicators
    if (testCase.expectedRiskLevel === 'critical' && result.indicators.length === 0) {
      issues.push('No indicators detected for critical risk case');
      accuracy -= 10;
    }

    return {
      testCase,
      result,
      passed: issues.length === 0,
      accuracy: Math.max(0, accuracy),
      issues
    };
  }, []);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      for (const testCase of testCases) {
        const result = runTestCase(testCase);
        results.push(result);
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setTestResults(results);
      return results;
    } finally {
      setIsRunning(false);
    }
  }, [runTestCase]);

  const runSpecificTest = useCallback((testId: string) => {
    const testCase = testCases.find(tc => tc.id === testId);
    if (!testCase) return null;

    const result = runTestCase(testCase);
    setTestResults(prev => {
      const filtered = prev.filter(r => r.testCase.id !== testId);
      return [...filtered, result];
    });

    return result;
  }, [runTestCase]);

  const getTestSummary = useCallback(() => {
    if (testResults.length === 0) return null;

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.length - passed;
    const averageAccuracy = testResults.reduce((sum, r) => sum + r.accuracy, 0) / testResults.length;

    const byLanguage = testResults.reduce((acc, r) => {
      const lang = r.testCase.expectedLanguage;
      if (!acc[lang]) acc[lang] = { total: 0, passed: 0 };
      acc[lang].total++;
      if (r.passed) acc[lang].passed++;
      return acc;
    }, {} as Record<string, { total: number; passed: number }>);

    const byRiskLevel = testResults.reduce((acc, r) => {
      const level = r.testCase.expectedRiskLevel;
      if (!acc[level]) acc[level] = { total: 0, passed: 0 };
      acc[level].total++;
      if (r.passed) acc[level].passed++;
      return acc;
    }, {} as Record<string, { total: number; passed: number }>);

    return {
      total: testResults.length,
      passed,
      failed,
      passRate: (passed / testResults.length) * 100,
      averageAccuracy,
      byLanguage,
      byRiskLevel
    };
  }, [testResults]);

  return {
    testCases,
    testResults,
    isRunning,
    runAllTests,
    runSpecificTest,
    getTestSummary
  };
};

export default useDistressDetectionTesting;
