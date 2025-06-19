import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import bcrypt from 'bcryptjs';

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
        console.log('🔧 Setting platform admin context for teacher management:', admin.email);
        // Use the correct function name that exists in the database
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
        console.log('✅ Platform admin context set successfully');
        // Wait longer for context to propagate - increased for maximum reliability
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('❌ Error setting admin context:', error);
      }
    }
  };

  const fetchTeachersWithRetry = async (maxRetries: number = 10) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to fetch teachers`);
        
        // Multiple context setting attempts for maximum reliability with longer waits
        for (let contextAttempt = 1; contextAttempt <= 5; contextAttempt++) {
          await setAdminContext();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .order('name');

        if (error) {
          console.error(`❌ Error fetching teachers (attempt ${attempt}):`, error);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
            continue;
          }
          throw error;
        }
        
        console.log('✅ Teachers fetched:', data?.length || 0);
        setTeachers(data || []);
        return;
      } catch (error) {
        console.error(`💥 Error fetching teachers (attempt ${attempt}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
        }
      }
    }
    
    toast.error('Failed to fetch teachers after multiple attempts');
    setTeachers([]);
  };

  const fetchSchoolsWithRetry = async (maxRetries: number = 10) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to fetch schools`);
        
        // Multiple context setting attempts with longer waits
        for (let contextAttempt = 1; contextAttempt <= 5; contextAttempt++) {
          await setAdminContext();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const { data, error } = await supabase
          .from('teachers')
          .select('school')
          .not('school', 'is', null);

        if (error) {
          console.error(`❌ Error fetching schools (attempt ${attempt}):`, error);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
            continue;
          }
          throw error;
        }
        
        const uniqueSchools = [...new Set(data?.map(item => item.school) || [])];
        console.log('✅ Schools fetched:', uniqueSchools.length);
        setSchools(uniqueSchools);
        return;
      } catch (error) {
        console.error(`💥 Error fetching schools (attempt ${attempt}):`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
        }
      }
    }
    
    console.warn('Failed to fetch schools after multiple attempts');
    setSchools([]);
  };

  const addTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.school || !newTeacher.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('👨‍🏫 Creating new teacher:', newTeacher.name);
      
      // Enhanced admin context setting with multiple attempts and longer waits
      for (let attempt = 1; attempt <= 7; attempt++) {
        await setAdminContext();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Hash the password
      const passwordHash = await bcrypt.hash(newTeacher.password, 12);
      console.log('🔐 Password hashed successfully');

      const teacherData = {
        name: newTeacher.name,
        email: newTeacher.email,
        school: newTeacher.school,
        role: newTeacher.role,
        specialization: newTeacher.specialization || null,
        license_number: newTeacher.license_number || null,
        password_hash: passwordHash
      };

      console.log('📝 Inserting teacher data...');
      const { data: insertResult, error } = await supabase
        .from('teachers')
        .insert(teacherData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating teacher:', error);
        throw error;
      }

      console.log('✅ Teacher created successfully:', insertResult);
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
      
      fetchTeachersWithRetry();
    } catch (error) {
      console.error('💥 Error adding teacher:', error);
      if (error.message?.includes('permission denied')) {
        toast.error('Permission denied: Refreshing admin permissions and retrying...');
        // Try to refresh context and retry once
        await setAdminContext();
        setTimeout(() => addTeacher(), 5000);
      } else if (error.message?.includes('unique constraint')) {
        toast.error('A teacher with this email already exists');
      } else {
        toast.error(`Failed to add teacher: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting teacher:', teacherName);
      
      // Enhanced admin context setting with multiple attempts and longer waits
      for (let attempt = 1; attempt <= 7; attempt++) {
        await setAdminContext();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) {
        console.error('❌ Error deleting teacher:', error);
        throw error;
      }

      console.log('✅ Teacher deleted successfully');
      toast.success('Teacher deleted successfully');
      fetchTeachersWithRetry();
    } catch (error) {
      console.error('💥 Error deleting teacher:', error);
      if (error.message?.includes('permission denied')) {
        toast.error('Permission denied: Refreshing admin permissions...');
        await setAdminContext();
      } else {
        toast.error(`Failed to delete teacher: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.email) {
      // Delay initial load to ensure admin context is properly set with longer delay
      setTimeout(() => {
        fetchTeachersWithRetry();
        fetchSchoolsWithRetry();
      }, 3000);
    }
  }, [admin?.email]);

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="teacherSchool">School *</Label>
              <Select
                value={newTeacher.school}
                onValueChange={(value) => setNewTeacher(prev => ({ ...prev, school: value }))}
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="teacherSpecialization">Specialization</Label>
              <Input
                id="teacherSpecialization"
                value={newTeacher.specialization}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="Subject specialization"
                disabled={isLoading}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addTeacher} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Adding...' : 'Add Teacher'}
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
