
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { classScheduleService } from '@/services/classScheduleService';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowData {
  userType: 'admin' | 'teacher' | 'student' | 'doctor' | null;
  permissions: string[];
  availableActions: string[];
  dashboardData: any;
}

export const useUserWorkflow = () => {
  const { teacher, student } = useAuth();
  const { admin } = usePlatformAdmin();
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    userType: null,
    permissions: [],
    availableActions: [],
    dashboardData: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineUserWorkflow = async () => {
      setIsLoading(true);
      
      try {
        if (admin) {
          // Platform Admin: Full access to everything
          setWorkflowData({
            userType: 'admin',
            permissions: ['view_all_schools', 'manage_users', 'view_analytics', 'system_admin'],
            availableActions: ['manage_schools', 'view_reports', 'manage_discount_codes'],
            dashboardData: await fetchAdminData()
          });
        } else if (teacher) {
          // School Admin or Teacher workflow
          if (teacher.role === 'admin') {
            setWorkflowData({
              userType: 'admin',
              permissions: ['view_school_feedback', 'manage_teachers', 'view_analytics'],
              availableActions: ['view_feedback_reports', 'manage_school_users'],
              dashboardData: await fetchSchoolAdminData(teacher.school)
            });
          } else if (teacher.role === 'doctor') {
            setWorkflowData({
              userType: 'doctor',
              permissions: ['view_mental_health', 'access_weekly_summaries', 'provide_support'],
              availableActions: ['view_weekly_summaries', 'manage_mental_health_alerts', 'live_chat'],
              dashboardData: await fetchDoctorData(teacher.school)
            });
          } else {
            setWorkflowData({
              userType: 'teacher',
              permissions: ['upload_schedules', 'view_feedback', 'manage_classes'],
              availableActions: ['create_schedules', 'bulk_upload', 'view_class_feedback'],
              dashboardData: await fetchTeacherData(teacher.id, teacher.school)
            });
          }
        } else if (student) {
          setWorkflowData({
            userType: 'student',
            permissions: ['view_classes', 'submit_feedback', 'access_mental_health'],
            availableActions: ['view_upcoming_classes', 'submit_feedback', 'weekly_summary', 'live_chat'],
            dashboardData: await fetchStudentData(student.id, student.school, student.grade)
          });
        }
      } catch (error) {
        console.error('Error determining user workflow:', error);
      } finally {
        setIsLoading(false);
      }
    };

    determineUserWorkflow();
  }, [admin, teacher, student]);

  const fetchAdminData = async () => {
    // Fetch platform admin dashboard data
    return {
      totalSchools: 0,
      totalUsers: 0,
      systemMetrics: {}
    };
  };

  const fetchSchoolAdminData = async (school: string) => {
    try {
      // Fetch feedback per teacher per lesson for school admin
      const { data: feedbackData } = await supabase
        .from('feedback_analytics')
        .select('*')
        .eq('school', school);

      const { data: teachersData } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', school);

      return {
        feedback: feedbackData,
        teachers: teachersData,
        school
      };
    } catch (error) {
      console.error('Error fetching school admin data:', error);
      return null;
    }
  };

  const fetchDoctorData = async (school: string) => {
    try {
      // Fetch weekly summaries and mental health alerts
      const { data: weeklySummaries } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('school', school);

      const { data: mentalHealthAlerts } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', school)
        .eq('is_reviewed', false);

      return {
        weeklySummaries,
        mentalHealthAlerts,
        school
      };
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      return null;
    }
  };

  const fetchTeacherData = async (teacherId: string, school: string) => {
    try {
      // Fetch teacher's schedules and feedback
      const schedules = await classScheduleService.getSchedulesByTeacher(teacherId);
      
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules(*)
        `)
        .eq('class_schedules.teacher_id', teacherId);

      return {
        schedules: schedules.data,
        feedback: feedbackData,
        teacherId,
        school
      };
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      return null;
    }
  };

  const fetchStudentData = async (studentId: string, school: string, grade: string) => {
    try {
      // Fetch upcoming classes for student
      const { data: upcomingClasses } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', school)
        .eq('grade', grade)
        .gte('class_date', new Date().toISOString().split('T')[0]);

      // Fetch student's previous feedback
      const { data: studentFeedback } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', studentId);

      return {
        upcomingClasses,
        previousFeedback: studentFeedback,
        studentId,
        school,
        grade
      };
    } catch (error) {
      console.error('Error fetching student data:', error);
      return null;
    }
  };

  return {
    workflowData,
    isLoading,
    refreshWorkflow: () => {
      setIsLoading(true);
      // Trigger re-fetch
    }
  };
};
