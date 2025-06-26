
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogInIcon, AlertCircle } from "lucide-react";

interface SecureStudentLoginFormProps {
  onLogin: (fullName: string, school: string, grade: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const grades = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const SecureStudentLoginForm: React.FC<SecureStudentLoginFormProps> = ({ onLogin, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(fullName, school, grade, password);
  };

  const getGradeLevel = (grade: string): number => {
    const gradeNumber = grade.toLowerCase().replace(/[^0-9]/g, '');
    if (grade.toLowerCase().includes('kindergarten')) return 0;
    return parseInt(gradeNumber) || 6;
  };

  const getPasswordGuidance = (grade: string) => {
    const gradeLevel = getGradeLevel(grade);
    if (gradeLevel <= 3) {
      return "Enter the password your teacher gave you. It might be something like 'cat12' or 'temp45'.";
    } else if (gradeLevel <= 6) {
      return "Enter your password. If you forgot it, ask your teacher to help reset it.";
    } else {
      return "Enter your password. Contact your teacher if you need a password reset.";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="Enter your school name"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="grade">Grade</Label>
        <Select value={grade} onValueChange={setGrade} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select your grade" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((gradeOption) => (
              <SelectItem key={gradeOption} value={gradeOption}>
                {gradeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
        
        {grade && (
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              {getPasswordGuidance(grade)}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-teal hover:bg-brand-teal/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing In...
          </>
        ) : (
          <>
            <LogInIcon className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
};

export default SecureStudentLoginForm;
