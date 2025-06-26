
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyIcon, SearchIcon, RefreshCwIcon, CopyIcon, CheckIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentPasswordResetProps {
  teacher: {
    id: string;
    name: string;
    school: string;
  };
}

interface ResetResult {
  success: boolean;
  temporary_password: string;
  message: string;
  student_id: string;
}

const StudentPasswordReset: React.FC<StudentPasswordResetProps> = ({ teacher }) => {
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResetPassword = async () => {
    if (!studentName.trim() || !studentGrade.trim()) {
      toast.error('Please enter both student name and grade');
      return;
    }

    setIsLoading(true);
    setResetResult(null);

    try {
      const { data, error } = await supabase.rpc('teacher_reset_student_password', {
        student_name_param: studentName.trim(),
        student_school_param: teacher.school,
        student_grade_param: studentGrade.trim(),
        teacher_id_param: teacher.id
      });

      if (error) {
        console.error('Password reset error:', error);
        toast.error('Failed to reset password: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0] as ResetResult;
        setResetResult(result);
        
        if (result.success) {
          toast.success('Password reset successfully! Share the temporary password with the student.');
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!resetResult?.temporary_password) return;
    
    try {
      await navigator.clipboard.writeText(resetResult.temporary_password);
      setCopied(true);
      toast.success('Temporary password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentGrade('');
    setResetResult(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-brand-orange" />
            Student Password Reset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Help students who have forgotten their passwords by generating a temporary password. 
              The student will be required to change this password when they first log in.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">Student Full Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's full name"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="studentGrade">Grade</Label>
              <Input
                id="studentGrade"
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                placeholder="Enter student's grade"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>

          {resetResult && (
            <div className="mt-6">
              {resetResult.success ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Password Reset Successful
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-green-800">
                          Temporary Password:
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-white px-3 py-2 rounded border text-lg font-mono">
                            {resetResult.temporary_password}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copyToClipboard}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            {copied ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <CopyIcon className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertDescription className="text-green-800">
                          <strong>Important:</strong> Share this temporary password with the student. 
                          They must change it on their first login. The temporary password expires in 48 hours.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <Badge className="bg-red-100 text-red-800 mb-2">
                      Reset Failed
                    </Badge>
                    <p className="text-red-700">{resetResult.message}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Help Students</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter the student's exact full name and grade as registered</li>
            <li>Click "Reset Password" to generate a temporary password</li>
            <li>Share the temporary password with the student (in person or via secure method)</li>
            <li>Instruct the student to log in with their name, school, grade, and the temporary password</li>
            <li>The student will be prompted to create a new password on first login</li>
            <li>Temporary passwords expire after 48 hours</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPasswordReset;
