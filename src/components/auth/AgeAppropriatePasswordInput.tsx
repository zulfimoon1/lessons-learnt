
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AgeAppropriatePasswordInputProps {
  password: string;
  onPasswordChange: (password: string) => void;
  gradeLevel?: number;
  studentName?: string;
  showStrengthMeter?: boolean;
  required?: boolean;
  disabled?: boolean;
}

interface PasswordValidation {
  is_valid: boolean;
  score: number;
  feedback: string[];
  grade_level: number;
  min_length: number;
}

const AgeAppropriatePasswordInput: React.FC<AgeAppropriatePasswordInputProps> = ({
  password,
  onPasswordChange,
  gradeLevel = 6,
  studentName,
  showStrengthMeter = true,
  required = true,
  disabled = false
}) => {
  const [validation, setValidation] = useState<PasswordValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (password.length > 0) {
      validatePassword();
    } else {
      setValidation(null);
    }
  }, [password, gradeLevel]);

  const validatePassword = async () => {
    if (password.length === 0) return;
    
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_student_password', {
        password_text: password,
        student_grade_level: gradeLevel
      });

      if (error) throw error;
      
      // Type assertion for the JSON response - cast through unknown first
      if (data) {
        setValidation(data as unknown as PasswordValidation);
      }
    } catch (error) {
      console.error('Password validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStrengthColor = (score: number, gradeLevel: number) => {
    const threshold = gradeLevel <= 6 ? 2 : gradeLevel <= 9 ? 3 : 4;
    if (score >= threshold) return 'bg-green-500';
    if (score >= threshold - 1) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number, gradeLevel: number) => {
    const threshold = gradeLevel <= 6 ? 2 : gradeLevel <= 9 ? 3 : 4;
    if (score >= threshold) return 'Great password!';
    if (score >= threshold - 1) return 'Good password';
    return 'Could be stronger';
  };

  const getGradeLevelGuidance = (gradeLevel: number) => {
    if (gradeLevel <= 3) {
      return "Make a password that's easy to remember! Try your favorite animal and a number.";
    } else if (gradeLevel <= 6) {
      return "Create a password with letters and maybe some numbers. Make it something you'll remember!";
    } else if (gradeLevel <= 9) {
      return "Mix letters and numbers to make your password stronger. Consider using a phrase you like.";
    } else {
      return "Use a combination of letters, numbers, and maybe symbols for the best protection.";
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="password" className="text-sm font-medium">
        Password {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Grade-level guidance */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          {getGradeLevelGuidance(gradeLevel)}
        </AlertDescription>
      </Alert>

      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder={gradeLevel <= 6 ? "Enter your password" : "Create a strong password"}
        disabled={disabled}
        className={validation?.is_valid === false ? 'border-red-300' : validation?.is_valid ? 'border-green-300' : ''}
      />

      {/* Password strength meter */}
      {showStrengthMeter && password.length > 0 && validation && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Password strength:</span>
            <Badge 
              variant="outline" 
              className={`${validation.is_valid ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}`}
            >
              {getStrengthText(validation.score, validation.grade_level)}
            </Badge>
          </div>
          
          <Progress 
            value={(validation.score / 5) * 100} 
            className="h-2"
          />
          
          {/* Feedback messages */}
          {validation.feedback.length > 0 && (
            <div className="space-y-1">
              {validation.feedback.map((message, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {validation.is_valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={validation.is_valid ? 'text-green-700' : 'text-yellow-700'}>
                    {message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Encouraging message for valid passwords */}
          {validation.is_valid && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle className="w-4 h-4" />
              <span>Perfect! Your password is strong enough to keep your account safe.</span>
            </div>
          )}
        </div>
      )}

      {/* Minimum requirements */}
      <div className="text-xs text-gray-500">
        Minimum {validation?.min_length || (gradeLevel <= 3 ? 4 : gradeLevel <= 6 ? 6 : gradeLevel <= 9 ? 7 : 8)} characters required
      </div>
    </div>
  );
};

export default AgeAppropriatePasswordInput;
