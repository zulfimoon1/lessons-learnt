
import React from 'react';
import EnhancedPasswordReset from '@/components/auth/EnhancedPasswordReset';
import StudentLoginActivity from './StudentLoginActivity';

interface StudentPasswordResetProps {
  teacher: {
    id: string;
    name: string;
    school: string;
  };
}

const StudentPasswordReset: React.FC<StudentPasswordResetProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Password Reset */}
      <EnhancedPasswordReset teacher={teacher} />
      
      {/* Student Login Activity Monitoring */}
      <StudentLoginActivity teacher={teacher} />
    </div>
  );
};

export default StudentPasswordReset;
