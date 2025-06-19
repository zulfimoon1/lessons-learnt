
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

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

  const fetchStudentsViaEdgeFunction = async () => {
    try {
      console.log('🔄 Fetching students via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getStudents',
          adminEmail: admin?.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Students fetched:', data.data?.length || 0);
        setStudents(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
    }
  };

  const fetchSchoolsViaEdgeFunction = async () => {
    try {
      console.log('🔄 Fetching schools via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getSchoolData',
          adminEmail: admin?.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        const schoolNames = (data.data || []).map((school: any) => school.name);
        console.log('✅ Schools fetched:', schoolNames.length);
        setSchools(schoolNames);
      } else {
        throw new Error(data?.error || 'Failed to fetch schools');
      }
    } catch (error) {
      console.error('❌ Error fetching schools:', error);
      setSchools([]);
    }
  };

  const addStudent = async () => {
    if (!newStudent.full_name || !newStudent.school || !newStudent.grade || !newStudent.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('👨‍🎓 Creating new student:', newStudent.full_name);

      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'createStudent',
          adminEmail: admin.email,
          studentData: newStudent
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Student created successfully');
        toast.success('Student added successfully');
        
        setNewStudent({
          full_name: '',
          school: '',
          grade: '',
          password: ''
        });
        
        fetchStudentsViaEdgeFunction();
      } else {
        throw new Error(data?.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('💥 Error adding student:', error);
      if (error.message?.includes('unique constraint')) {
        toast.error('A student with this name already exists at this school');
      } else {
        toast.error(`Failed to add student: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting student:', studentName);
      
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'deleteStudent',
          adminEmail: admin.email,
          studentId: studentId
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Student deleted successfully');
        toast.success('Student deleted successfully');
        fetchStudentsViaEdgeFunction();
      } else {
        throw new Error(data?.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('💥 Error deleting student:', error);
      toast.error(`Failed to delete student: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.email) {
      console.log('🚀 Starting student management data fetch...');
      fetchStudentsViaEdgeFunction();
      fetchSchoolsViaEdgeFunction();
    }
  }, [admin?.email]);

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
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="studentSchool">School *</Label>
              <Select
                value={newStudent.school}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, school: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.length > 0 ? (
                    schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_schools__" disabled>
                      No schools available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentGrade">Grade *</Label>
              <Input
                id="studentGrade"
                value={newStudent.grade}
                onChange={(e) => setNewStudent(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="Enter grade (e.g., 5, 10, 12)"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="studentPassword">Password *</Label>
              <Input
                id="studentPassword"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addStudent} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Adding...' : 'Add Student'}
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
