import React from 'react';
import { Button } from "@/components/ui/button";
import { secureStudentLogin } from '@/services/secureStudentAuthService';

const LoginTester = () => {
  const testLogin = async () => {
    console.log('🧪 LoginTester: Starting direct authentication test...');
    
    try {
      const result = await secureStudentLogin('demo student', 'demostudent123');
      console.log('🧪 LoginTester: Result:', result);
      
      if (result.error) {
        alert(`❌ Login failed: ${result.error}`);
      } else {
        alert(`✅ Login successful! Student: ${result.student?.full_name}`);
      }
    } catch (error) {
      console.error('🧪 LoginTester: Error:', error);
      alert(`💥 Error: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        onClick={testLogin}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        🧪 TEST LOGIN
      </Button>
    </div>
  );
};

export default LoginTester;