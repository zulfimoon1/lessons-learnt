
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyIcon, CopyIcon, CheckIcon, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnhancedPasswordResetProps {
  teacher: {
    id: string;
    name: string;
    school: string;
  };
}

interface ResetResult {
  success: boolean;
  temporary_password?: string;
  student_id?: string;
  message: string;
  expires_in_hours?: number;
}

const EnhancedPasswordReset: React.FC<EnhancedPasswordResetProps> = ({ teacher }) => {
  const { t } = useLanguage();
  
  const grades = [
    t('password.kindergarten'), t('password.grade1'), t('password.grade2'), t('password.grade3'), 
    t('password.grade4'), t('password.grade5'), t('password.grade6'), t('password.grade7'), 
    t('password.grade8'), t('password.grade9'), t('password.grade10'), t('password.grade11'), t('password.grade12')
  ];
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentResets, setRecentResets] = useState<ResetResult[]>([]);

  const handleResetPassword = async () => {
    if (!studentName.trim() || !studentGrade.trim()) {
      toast.error(t('password.pleaseEnterBothNameAndGrade'));
      return;
    }

    setIsLoading(true);
    setResetResult(null);

    try {
      const { data, error } = await supabase.rpc('teacher_reset_student_password_enhanced', {
        student_name_param: studentName.trim(),
        student_school_param: teacher.school,
        student_grade_param: studentGrade.trim(),
        teacher_id_param: teacher.id
      });

      if (error) {
        console.error('Password reset error:', error);
        toast.error(t('password.failedToReset') + ': ' + error.message);
        return;
      }

      if (data) {
        // Cast through unknown first to satisfy TypeScript
        const result = data as unknown as ResetResult;
        setResetResult(result);
        
        if (result.success) {
          // Add to recent resets
          setRecentResets(prev => [result, ...prev.slice(0, 4)]);
          toast.success(t('password.resetSuccessfully'));
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error(t('password.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t('password.temporaryPasswordCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('password.failedToCopy'));
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentGrade('');
    setResetResult(null);
    setCopied(false);
  };

  const getGradeLevel = (grade: string): number => {
    const gradeNumber = grade.toLowerCase().replace(/[^0-9]/g, '');
    if (grade.toLowerCase().includes(t('password.kindergarten').toLowerCase())) return 0;
    return parseInt(gradeNumber) || 6;
  };

  const getPasswordComplexityInfo = (grade: string) => {
    const gradeLevel = getGradeLevel(grade);
    if (gradeLevel <= 3) {
      return {
        minLength: 4,
        complexity: t('password.simplePasswords'),
        example: t('password.exampleCat12')
      };
    } else if (gradeLevel <= 6) {
      return {
        minLength: 6,
        complexity: t('password.basicPasswords'),
        example: t('password.exampleStudent123')
      };
    } else if (gradeLevel <= 9) {
      return {
        minLength: 7,
        complexity: t('password.moderatePasswords'),
        example: t('password.exampleSchool2024')
      };
    } else {
      return {
        minLength: 8,
        complexity: t('password.strongPasswords'),
        example: t('password.exampleSecure')
      };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-brand-orange" />
            {t('password.enhancedStudentPasswordReset')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {t('password.generateAgeAppropriate')}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">{t('password.studentFullName')}</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t('password.enterStudentFullName')}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="studentGrade">{t('password.grade')}</Label>
              <Select value={studentGrade} onValueChange={setStudentGrade} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t('password.selectGrade')} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password complexity info */}
          {studentGrade && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <strong>{t('password.forStudents', { grade: studentGrade })}:</strong><br />
                {getPasswordComplexityInfo(studentGrade).complexity}<br />
                <span className="text-sm text-blue-600">
                  {getPasswordComplexityInfo(studentGrade).example}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t('password.generating')}
                </>
              ) : (
                <>
                  <KeyIcon className="w-4 h-4 mr-2" />
                  {t('password.generatePassword')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              {t('password.clear')}
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
                          {t('password.generatedSuccessfully')}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-green-800">
                          {t('password.temporaryPassword')}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-white px-3 py-2 rounded border text-lg font-mono font-bold">
                            {resetResult.temporary_password}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(resetResult.temporary_password!)}
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
                        <Clock className="w-4 h-4" />
                        <AlertDescription className="text-green-800">
                          <strong>{t('password.important')}</strong> {t('password.expiresInHours', { hours: resetResult.expires_in_hours?.toString() })}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <Badge className="bg-red-100 text-red-800 mb-2">
                      {t('password.resetFailed')}
                    </Badge>
                    <p className="text-red-700">{resetResult.message}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent resets */}
          {recentResets.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('password.recentPasswordResets')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentResets.map((reset, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('password.studentReset')}</span>
                      <Badge variant="outline" className="text-xs">
                        {t('password.hoursRemaining', { hours: reset.expires_in_hours?.toString() })}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPasswordReset;
