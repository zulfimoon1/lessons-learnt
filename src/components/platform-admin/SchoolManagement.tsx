
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

    console.log('🗑️ STARTING COMPLETE SCHOOL DELETION PROCESS');
    console.log('🔍 School to delete:', schoolName);

    setIsLoading(true);
    try {
      await setAdminContext();
      console.log(`🗑️ Starting deletion of school: ${schoolName}`);
      
      // Step 1: Delete ALL feedback first (no foreign key constraints to worry about)
      console.log('🗑️ Step 1: Deleting ALL feedback for this school...');
      
      // Get all class schedules for this school first
      const { data: schoolSchedules, error: schedulesQueryError } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('school', schoolName);

      if (schedulesQueryError) {
        console.error('Error getting schedules:', schedulesQueryError);
      }

      // Get all students for this school
      const { data: schoolStudents, error: studentsQueryError } = await supabase
        .from('students')
        .select('id')
        .eq('school', schoolName);

      if (studentsQueryError) {
        console.error('Error getting students:', studentsQueryError);
      }

      // Delete feedback by class schedule IDs
      if (schoolSchedules && schoolSchedules.length > 0) {
        const scheduleIds = schoolSchedules.map(s => s.id);
        const { error: feedbackScheduleError } = await supabase
          .from('feedback')
          .delete()
          .in('class_schedule_id', scheduleIds);

        if (feedbackScheduleError) {
          console.error('Error deleting schedule feedback:', feedbackScheduleError);
        } else {
          console.log('✅ Schedule-based feedback deleted');
        }
      }

      // Delete feedback by student IDs
      if (schoolStudents && schoolStudents.length > 0) {
        const studentIds = schoolStudents.map(s => s.id);
        const { error: feedbackStudentError } = await supabase
          .from('feedback')
          .delete()
          .in('student_id', studentIds);

        if (feedbackStudentError) {
          console.error('Error deleting student feedback:', feedbackStudentError);
        } else {
          console.log('✅ Student-based feedback deleted');
        }
      }

      // Step 2: Delete mental health alerts for this school
      console.log('🗑️ Step 2: Deleting mental health alerts...');
      const { error: alertsError } = await supabase
        .from('mental_health_alerts')
        .delete()
        .eq('school', schoolName);

      if (alertsError) {
        console.error('Error deleting mental health alerts:', alertsError);
      } else {
        console.log('✅ Mental health alerts deleted');
      }

      // Step 3: Delete weekly summaries for students from this school
      console.log('🗑️ Step 3: Deleting weekly summaries...');
      const { error: summariesError } = await supabase
        .from('weekly_summaries')
        .delete()
        .eq('school', schoolName);

      if (summariesError) {
        console.error('Error deleting weekly summaries:', summariesError);
      } else {
        console.log('✅ Weekly summaries deleted');
      }

      // Step 4: Delete class schedules
      console.log('🗑️ Step 4: Deleting class schedules...');
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .delete()
        .eq('school', schoolName);

      if (scheduleError) {
        console.error('Error deleting class schedules:', scheduleError);
        throw scheduleError;
      }
      console.log('✅ Class schedules deleted');

      // Step 5: Delete students
      console.log('🗑️ Step 5: Deleting students...');
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('school', schoolName);

      if (studentError) {
        console.error('Error deleting students:', studentError);
        throw studentError;
      }
      console.log('✅ Students deleted');

      // Step 6: Delete other school-related data
      console.log('🗑️ Step 6: Deleting other school data...');
      
      // Delete school psychologists
      const { error: psychologistsError } = await supabase
        .from('school_psychologists')
        .delete()
        .eq('school', schoolName);

      if (psychologistsError) {
        console.error('Error deleting school psychologists:', psychologistsError);
      } else {
        console.log('✅ School psychologists deleted');
      }

      // Delete mental health articles
      const { error: articlesError } = await supabase
        .from('mental_health_articles')
        .delete()
        .eq('school', schoolName);

      if (articlesError) {
        console.error('Error deleting mental health articles:', articlesError);
      } else {
        console.log('✅ Mental health articles deleted');
      }

      // Step 7: Delete teachers (LAST - they might be referenced by other tables)
      console.log('🗑️ Step 7: Deleting teachers...');
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
      
      // CRITICAL: Force dashboard refresh with a longer delay
      console.log('🔄 Triggering main dashboard refresh after school deletion...');
      if (onDataChange) {
        console.log('✅ Calling onDataChange callback NOW!');
        // Use a longer delay to ensure all database operations are truly complete
        setTimeout(() => {
          console.log('🚀 Delayed onDataChange callback executing...');
          onDataChange();
        }, 500);
      } else {
        console.log('❌ No onDataChange callback provided!');
      }
      
    } catch (error) {
      console.error('Error deleting school:', error);
      toast.error('Failed to delete school. Please try again.');
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
