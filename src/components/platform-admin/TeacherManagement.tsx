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
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  specialization?: string;
  license_number?: string;
  is_available: boolean;
}

const TeacherManagement: React.FC = () => {
  const { admin } = usePlatformAdmin();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    school: '',
    role: 'teacher',
    specialization: '',
    license_number: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const setAdminContext = async () => {
    if (admin?.email) {
      try {
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
      } catch (error) {
        console.error('Error setting admin context:', error);
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      await setAdminContext();
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
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

  const addTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.school || !newTeacher.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      const passwordHash = await hashPassword(newTeacher.password);

      const { error } = await supabase
        .from('teachers')
        .insert({
          name: newTeacher.name,
          email: newTeacher.email,
          school: newTeacher.school,
          role: newTeacher.role,
          specialization: newTeacher.specialization || null,
          license_number: newTeacher.license_number || null,
          password_hash: passwordHash
        });

      if (error) throw error;

      toast.success('Teacher added successfully');
      setNewTeacher({
        name: '',
        email: '',
        school: '',
        role: 'teacher',
        specialization: '',
        license_number: '',
        password: ''
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error('Failed to add teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSchools();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Teacher Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new teacher form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
            <div>
              <Label htmlFor="teacherName">Name *</Label>
              <Input
                id="teacherName"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Teacher name"
              />
            </div>
            <div>
              <Label htmlFor="teacherEmail">Email *</Label>
              <Input
                id="teacherEmail"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                placeholder="teacher@school.com"
              />
            </div>
            <div>
              <Label htmlFor="teacherSchool">School *</Label>
              <Select
                value={newTeacher.school}
                onValueChange={(value) => setNewTeacher(prev => ({ ...prev, school: value }))}
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
              <Label htmlFor="teacherRole">Role</Label>
              <Select
                value={newTeacher.role}
                onValueChange={(value) => setNewTeacher(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacherPassword">Password *</Label>
              <Input
                id="teacherPassword"
                type="password"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
            </div>
            <div>
              <Label htmlFor="teacherSpecialization">Specialization</Label>
              <Input
                id="teacherSpecialization"
                value={newTeacher.specialization}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="Subject specialization"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addTeacher} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>

          {/* Teachers list */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Teachers ({teachers.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {teachers.length === 0 ? (
                <p className="text-muted-foreground">No teachers found</p>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{teacher.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email} • {teacher.school} • {teacher.role}
                        {teacher.specialization && ` • ${teacher.specialization}`}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTeacher(teacher.id, teacher.name)}
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

export default TeacherManagement;
