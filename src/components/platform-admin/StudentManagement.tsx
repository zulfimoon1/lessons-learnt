
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

  const ensurePlatformAdminContext = async () => {
    if (admin?.email) {
      await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('🔄 Fetching students...');
      await ensurePlatformAdminContext();
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching students:', error);
        toast.error('Failed to fetch students');
        setStudents([]);
      } else {
        console.log('✅ Students fetched:', data?.length || 0);
        setStudents(data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
    }
  };

  const fetchSchools = async () => {
    try {
      console.log('🔄 Fetching schools...');
      await ensurePlatformAdminContext();
      
      const { data, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'eq', 'Platform Administration');

      if (error) {
        console.error('❌ Error fetching schools:', error);
        setSchools([]);
      } else {
        // Group by school and get unique schools
        const schoolNames = [...new Set((data || []).map(teacher => teacher.school))];
        console.log('✅ Schools fetched:', schoolNames.length);
        setSchools(schoolNames);
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
      await ensurePlatformAdminContext();

      // Hash password
      const crypto = await import('crypto');
      const hashedPassword = crypto.createHash('sha256').update(newStudent.password + 'simple_salt_2024').digest('hex');

      const { data, error } = await supabase
        .from('students')
        .insert([{
          full_name: newStudent.full_name,
          school: newStudent.school,
          grade: newStudent.grade,
          password_hash: hashedPassword
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Student created successfully');
      toast.success('Student added successfully');
      
      setNewStudent({
        full_name: '',
        school: '',
        grade: '',
        password: ''
      });
      
      fetchStudents();
    } catch (error) {
      console.error('💥 Error adding student:', error);
      if (error.message?.includes('unique constraint') || error.message?.includes('duplicate')) {
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
      await ensurePlatformAdminContext();
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      
      console.log('✅ Student deleted successfully');
      toast.success('Student deleted successfully');
      fetchStudents();
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
      fetchStudents();
      fetchSchools();
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
