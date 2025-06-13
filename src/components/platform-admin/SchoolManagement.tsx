
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, School } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

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

  const setAdminContext = async () => {
    if (admin?.email) {
      try {
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
      } catch (error) {
        console.error('Error setting admin context:', error);
      }
    }
  };

  const fetchSchools = async () => {
    try {
      await setAdminContext();
      
      // Get unique schools from teachers table with counts
      const { data: teacherSchools, error: teacherError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      const { data: studentSchools, error: studentError } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);

      if (teacherError) throw teacherError;
      if (studentError) throw studentError;

      // Combine and count schools
      const allSchools = [...(teacherSchools || []), ...(studentSchools || [])];
      const schoolCounts = allSchools.reduce((acc, { school }) => {
        acc[school] = (acc[school] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get teacher counts per school
      const teacherCounts = (teacherSchools || []).reduce((acc, { school }) => {
        acc[school] = (acc[school] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get student counts per school
      const studentCounts = (studentSchools || []).reduce((acc, { school }) => {
        acc[school] = (acc[school] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const schoolList = Object.keys(schoolCounts).map(name => ({
        name,
        teacher_count: teacherCounts[name] || 0,
        student_count: studentCounts[name] || 0
      }));

      setSchools(schoolList);
      console.log('🏫 Schools updated:', schoolList.length, 'schools found');
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
    }
  };

  const addSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error('Please enter a school name');
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      
      // Create a placeholder teacher for the new school
      const { error } = await supabase
        .from('teachers')
        .insert({
          name: 'Administrator',
          email: `admin@${newSchoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
          school: newSchoolName.trim(),
          role: 'admin',
          password_hash: '$2b$10$placeholder' // This should be properly hashed
        });

      if (error) throw error;

      toast.success('School added successfully');
      setNewSchoolName('');
      await fetchSchools();
      
      // Trigger main dashboard refresh
      console.log('🔄 Triggering dashboard refresh after school creation...');
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error adding school:', error);
      toast.error('Failed to add school');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchool = async (schoolName: string) => {
    if (!confirm(`Are you sure you want to delete ${schoolName} and all associated data?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      console.log(`🗑️ Starting deletion of school: ${schoolName}`);
      
      // Delete all class schedules from the school first
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .delete()
        .eq('school', schoolName);

      if (scheduleError) {
        console.error('Error deleting class schedules:', scheduleError);
        throw scheduleError;
      }

      // Delete all students from the school
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('school', schoolName);

      if (studentError) {
        console.error('Error deleting students:', studentError);
        throw studentError;
      }

      // Delete all teachers from the school
      const { error: teacherError } = await supabase
        .from('teachers')
        .delete()
        .eq('school', schoolName);

      if (teacherError) {
        console.error('Error deleting teachers:', teacherError);
        throw teacherError;
      }

      console.log(`✅ Successfully deleted school: ${schoolName}`);
      toast.success(`School "${schoolName}" deleted successfully`);
      
      // Refresh local schools list first
      await fetchSchools();
      
      // IMPORTANT: Trigger main dashboard refresh immediately after deletion
      console.log('🔄 Triggering main dashboard refresh after school deletion...');
      if (onDataChange) {
        onDataChange();
      }
      
    } catch (error) {
      console.error('Error deleting school:', error);
      toast.error('Failed to delete school');
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
              />
            </div>
            <Button 
              onClick={addSchool} 
              disabled={isLoading}
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add School
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
