
import { supabase } from '@/integrations/supabase/client';

interface ClassSchedule {
  id?: string;
  teacher_id: string;
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
}

class ClassScheduleService {
  async createSchedule(scheduleData: Omit<ClassSchedule, 'id'>) {
    try {
      console.log('Creating class schedule:', scheduleData);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
      }
      
      const { data, error } = await supabase
        .from('class_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      console.log('Schedule created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Schedule creation failed:', error);
      return { data: null, error };
    }
  }

  async getSchedulesByTeacher(teacherId: string) {
    try {
      console.log('Fetching schedules for teacher:', teacherId);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
      }
      
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('class_date', { ascending: true });

      if (error) {
        console.error('Error fetching teacher schedules:', error);
        throw error;
      }
      
      console.log('Teacher schedules fetched successfully:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching teacher schedules:', error);
      return { data: null, error };
    }
  }

  async getSchedulesBySchool(school: string) {
    try {
      console.log('Fetching schedules for school:', school);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
      }
      
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', school)
        .order('class_date', { ascending: true });

      if (error) {
        console.error('Error fetching school schedules:', error);
        throw error;
      }
      
      console.log('School schedules fetched successfully:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching school schedules:', error);
      return { data: null, error };
    }
  }

  async bulkCreateSchedules(schedules: Omit<ClassSchedule, 'id'>[]) {
    try {
      console.log('Creating bulk schedules:', schedules.length);
      
      // Set platform admin context if we have admin email stored
      const adminEmail = localStorage.getItem('platform_admin');
      if (adminEmail) {
        const adminData = JSON.parse(adminEmail);
        await supabase.rpc('set_platform_admin_context', { admin_email: adminData.email });
      }
      
      const { data, error } = await supabase
        .from('class_schedules')
        .insert(schedules)
        .select();

      if (error) {
        console.error('Error creating bulk schedules:', error);
        throw error;
      }

      console.log('Bulk schedules created successfully:', data?.length);
      return { data, error: null };
    } catch (error) {
      console.error('Bulk schedule creation failed:', error);
      return { data: null, error };
    }
  }
}

export const classScheduleService = new ClassScheduleService();
