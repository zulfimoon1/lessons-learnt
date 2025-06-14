
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hashPassword } from '@/services/securePasswordService';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securityValidationService } from '@/services/securityValidationService';

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  created_at: string;
}

const StudentManagement: React.FC = () => {
  const { admin } = usePlatformAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    school: '',
    grade: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const setAdminContext = async () => {
    if (admin?.email) {
      try {
        console.log('Setting admin context for:', admin.email);
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
        console.log('Admin context set successfully');
      } catch (error) {
        console.error('Error setting admin context:', error);
        await securityValidationService.logSecurityEvent(
          'suspicious_activity',
          admin.id,
          `Failed to set admin context: ${error}`,
          'medium'
        );
      }
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      await setAdminContext();
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      console.log('Students fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to fetch students: ' + error.message);
        return;
      }
      
      console.log('Setting students:', data?.length || 0, 'students found');
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      await securityValidationService.logSecurityEvent(
        'suspicious_activity',
        admin?.id,
        `Error fetching students: ${error}`,
        'medium'
      );
    }
  };

  const fetchSchools = async () => {
    try {
      await setAdminContext();
      const { data, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (error) throw error;
      
      const uniqueSchools = [...new Set(data?.map(item => item.school) || [])];
      setSchools(uniqueSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const addStudent = async () => {
    // Enhanced input validation using security service
    const nameValidation = securityValidationService.validateInput(newStudent.full_name, 'name');
    if (!nameValidation.isValid) {
      toast.error(nameValidation.errors.join(', '));
      return;
    }

    const schoolValidation = securityValidationService.validateInput(newStudent.school, 'school');
    if (!schoolValidation.isValid) {
      toast.error(schoolValidation.errors.join(', '));
      return;
    }

    const gradeValidation = securityValidationService.validateInput(newStudent.grade, 'grade');
    if (!gradeValidation.isValid) {
      toast.error(gradeValidation.errors.join(', '));
      return;
    }

    const passwordValidation = securityValidationService.validateInput(newStudent.password, 'password');
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors.join(', '));
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      
      // Check if student already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('full_name', nameValidation.sanitizedValue)
        .eq('school', schoolValidation.sanitizedValue)
        .eq('grade', gradeValidation.sanitizedValue)
        .single();

      if (existingStudent) {
        toast.error('Student already exists with these details');
        return;
      }

      const passwordHash = await hashPassword(passwordValidation.sanitizedValue);

      const { error } = await supabase
        .from('students')
        .insert({
          full_name: nameValidation.sanitizedValue,
          school: schoolValidation.sanitizedValue,
          grade: gradeValidation.sanitizedValue,
          password_hash: passwordHash
        });

      if (error) throw error;

      await securityValidationService.logSecurityEvent(
        'unauthorized_access', // Using closest available type for admin action
        admin?.id,
        `Admin created new student: ${nameValidation.sanitizedValue}`,
        'low'
      );

      toast.success('Student added successfully');
      setNewStudent({
        full_name: '',
        school: '',
        grade: '',
        password: ''
      });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      await securityValidationService.logSecurityEvent(
        'suspicious_activity',
        admin?.id,
        `Error adding student: ${error}`,
        'medium'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Deleting student:', studentId, studentName);
      await setAdminContext();
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student: ' + error.message);
      } else {
        console.log('Student deleted successfully, refetching list...');
        
        await securityValidationService.logSecurityEvent(
          'unauthorized_access', // Using closest available type for admin action
          admin?.id,
          `Admin deleted student: ${studentName}`,
          'medium'
        );
        
        toast.success('Student deleted successfully');
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
      await securityValidationService.logSecurityEvent(
        'suspicious_activity',
        admin?.id,
        `Error deleting student: ${error}`,
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Student Management
          <Shield className="w-4 h-4 text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new student form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
            <div>
              <Label htmlFor="studentName">Full Name *</Label>
              <Input
                id="studentName"
                value={newStudent.full_name}
                onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Student full name"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="studentSchool">School *</Label>
              <Select
                value={newStudent.school}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, school: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentGrade">Grade *</Label>
              <Select
                value={newStudent.grade}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentPassword">Password *</Label>
              <Input
                id="studentPassword"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 characters, include uppercase, lowercase, number"
                minLength={8}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addStudent} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Students list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Existing Students ({students.length})</h3>
              <Button 
                onClick={fetchStudents} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                Refresh List
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {students.length === 0 ? (
                <p className="text-muted-foreground">No students found</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{student.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.school} • Grade {student.grade} • {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteStudent(student.id, student.full_name)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentManagement;
