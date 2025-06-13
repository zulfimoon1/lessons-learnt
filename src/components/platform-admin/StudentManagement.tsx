
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hashPassword } from '@/services/securePasswordService';

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
  created_at: string;
}

const StudentManagement: React.FC = () => {
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

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const fetchSchools = async () => {
    try {
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
    if (!newStudent.full_name || !newStudent.school || !newStudent.grade || !newStudent.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const passwordHash = await hashPassword(newStudent.password);

      const { error } = await supabase
        .from('students')
        .insert({
          full_name: newStudent.full_name,
          school: newStudent.school,
          grade: newStudent.grade,
          password_hash: passwordHash
        });

      if (error) throw error;

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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
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
                placeholder="Student password"
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
            <h3 className="font-medium">Existing Students ({students.length})</h3>
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
