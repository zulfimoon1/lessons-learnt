
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, School } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securePlatformAdminService } from '@/services/securePlatformAdminService';

interface School {
  name: string;
  teacher_count: number;
  student_count: number;
}

interface SchoolManagementProps {
  onDataChange?: () => void;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({ onDataChange }) => {
  const { admin } = usePlatformAdmin();
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchools = async () => {
    if (!admin?.email) {
      console.warn('No admin email available');
      return;
    }

    try {
      console.log('🏫 Fetching schools...');
      
      const schoolData = await securePlatformAdminService.executeSecureQuery(
        admin.email,
        async () => {
          console.log('📊 Getting teacher and student data...');
          
          // Get all teachers and students directly
          const [teachersQuery, studentsQuery] = await Promise.allSettled([
            supabase.from('teachers').select('school'),
            supabase.from('students').select('school')
          ]);

          let teachers = [];
          let students = [];

          if (teachersQuery.status === 'fulfilled' && teachersQuery.value.data) {
            teachers = teachersQuery.value.data;
          }

          if (studentsQuery.status === 'fulfilled' && studentsQuery.value.data) {
            students = studentsQuery.value.data;
          }

          console.log('📊 Raw data:', { teachers: teachers.length, students: students.length });

          // Filter out admin/platform schools
          const excludedSchools = ['Platform Administration', 'platform administration', 'admin'];
          
          const validTeachers = teachers.filter(t => 
            t.school && !excludedSchools.some(excluded => 
              t.school.toLowerCase().includes(excluded.toLowerCase())
            )
          );
          
          const validStudents = students.filter(s => 
            s.school && !excludedSchools.some(excluded => 
              s.school.toLowerCase().includes(excluded.toLowerCase())
            )
          );

          // Count by school
          const teacherCounts = validTeachers.reduce((acc, t) => {
            acc[t.school] = (acc[t.school] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const studentCounts = validStudents.reduce((acc, s) => {
            acc[s.school] = (acc[s.school] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Get unique schools
          const allSchools = new Set([
            ...Object.keys(teacherCounts),
            ...Object.keys(studentCounts)
          ]);

          const schoolList = Array.from(allSchools).map(name => ({
            name,
            teacher_count: teacherCounts[name] || 0,
            student_count: studentCounts[name] || 0
          }));

          console.log('🏫 Processed schools:', schoolList);
          return schoolList;
        },
        []
      );

      setSchools(schoolData);
      console.log(`✅ Schools loaded: ${schoolData.length} schools`);
      
    } catch (error) {
      console.error('❌ Error fetching schools:', error);
      toast.error('Failed to load schools');
      setSchools([]);
    }
  };

  const addSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error('Please enter a school name');
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('➕ Adding school:', newSchoolName.trim());
      
      const adminEmail = `admin@${newSchoolName.toLowerCase().replace(/\s+/g, '')}.edu`;
      
      await securePlatformAdminService.executeDirectQuery(
        admin.email,
        'teachers',
        'insert',
        supabase.from('teachers').insert({
          name: `${newSchoolName} Administrator`,
          email: adminEmail,
          school: newSchoolName.trim(),
          role: 'admin',
          password_hash: '$2b$12$LQv3c1yX1/Y6GdE9e5Q8M.QmK5J5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qu'
        }).select().single()
      );

      console.log('✅ School created successfully');
      toast.success(`School "${newSchoolName}" added successfully`);
      setNewSchoolName('');
      await fetchSchools();
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (error: any) {
      console.error('❌ Error adding school:', error);
      
      if (error.code === '23505') {
        toast.error('School administrator already exists');
      } else {
        toast.error(`Failed to add school: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchool = async (schoolName: string) => {
    if (!confirm(`Are you sure you want to delete ${schoolName} and all associated data?`)) {
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting school:', schoolName);
      
      // Use the secure database function for deletion
      const result = await securePlatformAdminService.executeSecureQuery(
        admin.email,
        async () => {
          const { data, error } = await supabase.rpc('platform_admin_delete_school', {
            school_name_param: schoolName,
            admin_email_param: admin.email
          });

          if (error) {
            throw error;
          }

          return data;
        }
      );

      console.log('✅ School deleted:', result);
      toast.success(`School "${schoolName}" deleted successfully`);
      
      await fetchSchools();
      
      if (onDataChange) {
        setTimeout(() => {
          onDataChange();
        }, 100);
      }
      
    } catch (error: any) {
      console.error('❌ Error deleting school:', error);
      toast.error(`Failed to delete school: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="w-5 h-5" />
          School Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new school */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="Enter school name"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && newSchoolName.trim()) {
                    addSchool();
                  }
                }}
              />
            </div>
            <Button 
              onClick={addSchool} 
              disabled={isLoading || !newSchoolName.trim()}
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Adding...' : 'Add School'}
            </Button>
          </div>

          {/* Schools list */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Schools ({schools.length})</h3>
            {schools.length === 0 ? (
              <p className="text-muted-foreground">No schools found</p>
            ) : (
              schools.map((school) => (
                <div key={school.name} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{school.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {school.teacher_count} teachers, {school.student_count} students
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteSchool(school.name)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolManagement;
