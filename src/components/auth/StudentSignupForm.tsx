
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlusIcon } from "lucide-react";
import AgeAppropriatePasswordInput from './AgeAppropriatePasswordInput';

interface StudentSignupFormProps {
  onSignup: (fullName: string, school: string, grade: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading: boolean;
}

const grades = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const StudentSignupForm: React.FC<StudentSignupFormProps> = ({ onSignup, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignup(fullName, school, grade, password, confirmPassword);
  };

  const getGradeLevel = (grade: string): number => {
    const gradeNumber = grade.toLowerCase().replace(/[^0-9]/g, '');
    if (grade.toLowerCase().includes('kindergarten')) return 0;
    return parseInt(gradeNumber) || 6;
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

      {grade && (
        <AgeAppropriatePasswordInput
          password={password}
          onPasswordChange={setPassword}
          gradeLevel={getGradeLevel(grade)}
          studentName={fullName}
          showStrengthMeter={true}
          disabled={isLoading}
        />
      )}

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Enter your password again"
          required
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-teal hover:bg-brand-teal/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating Account...
          </>
        ) : (
          <>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
};

export default StudentSignupForm;
