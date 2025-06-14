
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const AdminSignupTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Platform admin accounts are created through the system database. 
          Please contact the system administrator if you need access to the platform console.
        </AlertDescription>
      </Alert>

      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-semibold">To request admin access:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Contact your system administrator</li>
          <li>Provide your email address and intended role</li>
          <li>Wait for account creation and credentials</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Security Note:</strong> Admin accounts require manual verification 
          and cannot be self-registered for security purposes.
        </p>
      </div>
    </div>
  );
};

export default AdminSignupTab;
