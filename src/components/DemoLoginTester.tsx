
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testAllDemoAccounts, godModeTeacherLogin, godModeStudentLogin } from '@/services/demoAccountManager';
import { useToast } from '@/hooks/use-toast';

const DemoLoginTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testAllDemoAccounts();
      setResults(testResults);
      toast({
        title: "Demo Login Test Complete",
        description: "Check console for detailed results",
      });
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testIndividualAccount = async (type: 'teacher' | 'student', identifier: string) => {
    try {
      let result;
      if (type === 'teacher') {
        result = await godModeTeacherLogin(identifier, 'demo123');
      } else {
        result = await godModeStudentLogin(identifier, 'demo123');
      }
      
      toast({
        title: result ? "Login Success" : "Login Failed",
        description: `${identifier}: ${result ? 'Working' : 'Failed'}`,
        variant: result ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Test failed for ${identifier}:`, error);
      toast({
        title: "Test Error",
        description: `Error testing ${identifier}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Demo Login Tester (God Mode)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runFullTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test All Demo Accounts'}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Teacher Accounts</h3>
            <Button 
              onClick={() => testIndividualAccount('teacher', 'demoadmin@demo.com')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Test Demo Admin
            </Button>
            <Button 
              onClick={() => testIndividualAccount('teacher', 'demoteacher@demo.com')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Test Demo Teacher
            </Button>
            <Button 
              onClick={() => testIndividualAccount('teacher', 'demodoc@demo.com')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Test Demo Doctor
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Student Accounts</h3>
            <Button 
              onClick={() => testIndividualAccount('student', 'Demo Student')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Test Demo Student
            </Button>
          </div>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>All demo accounts use password: <code>demo123</code></p>
          <p>Press Ctrl+Shift+D on login pages to show this tester</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoLoginTester;
