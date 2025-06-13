
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
      console.log('🔍 onDataChange callback exists:', !!onDataChange);
      if (onDataChange) {
        console.log('🚀 Calling onDataChange callback now...');
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

    console.log('🗑️ STARTING SCHOOL DELETION PROCESS');
    console.log('🔍 School to delete:', schoolName);
    console.log('🔍 onDataChange callback exists:', !!onDataChange);

    setIsLoading(true);
    try {
      await setAdminContext();
      console.log(`🗑️ Starting deletion of school: ${schoolName}`);
      
      // Step 1: Delete all class schedules from the school first
      console.log('🗑️ Step 1: Deleting class schedules...');
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .delete()
        .eq('school', schoolName);

      if (scheduleError) {
        console.error('Error deleting class schedules:', scheduleError);
        throw scheduleError;
      }
      console.log('✅ Class schedules deleted');

      // Step 2: Delete all feedback related to this school
      console.log('🗑️ Step 2: Deleting feedback...');
      const { error: feedbackError } = await supabase
        .from('feedback')
        .delete()
        .in('class_schedule_id', 
          await supabase
            .from('class_schedules')
            .select('id')
            .eq('school', schoolName)
            .then(result => result.data?.map(item => item.id) || [])
        );

      // Also delete feedback from students of this school
      const { error: studentFeedbackError } = await supabase
        .from('feedback')
        .delete()
        .in('student_id',
          await supabase
            .from('students')
            .select('id')
            .eq('school', schoolName)
            .then(result => result.data?.map(item => item.id) || [])
        );

      console.log('✅ Feedback deleted');

      // Step 3: Delete all students from the school
      console.log('🗑️ Step 3: Deleting students...');
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('school', schoolName);

      if (studentError) {
        console.error('Error deleting students:', studentError);
        throw studentError;
      }
      console.log('✅ Students deleted');

      // Step 4: Delete all teachers from the school (this should be last)
      console.log('🗑️ Step 4: Deleting teachers...');
      const { error: teacherError } = await supabase
        .from('teachers')
        .delete()
        .eq('school', schoolName);

      if (teacherError) {
        console.error('Error deleting teachers:', teacherError);
        throw teacherError;
      }
      console.log('✅ Teachers deleted');

      console.log(`✅ Successfully deleted school: ${schoolName}`);
      toast.success(`School "${schoolName}" deleted successfully`);
      
      // Refresh local schools list first
      console.log('🔄 Refreshing local schools list...');
      await fetchSchools();
      
      // IMPORTANT: Trigger main dashboard refresh immediately after deletion
      console.log('🔄 Triggering main dashboard refresh after school deletion...');
      console.log('🚀 About to call onDataChange callback...');
      if (onDataChange) {
        console.log('✅ Calling onDataChange callback NOW!');
        onDataChange();
      } else {
        console.log('❌ No onDataChange callback provided!');
      }
      
    } catch (error) {
      console.error('Error deleting school:', error);
      toast.error('Failed to delete school');
    } finally {
      setIsLoading(false);
      console.log('🏁 School deletion process completed');
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
