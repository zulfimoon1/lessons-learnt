
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  status: string;
  doctor_id: string | null;
  is_anonymous: boolean;
  created_at: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
}

export const useChatSession = (teacherId: string, school: string) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [doctors, setDoctors] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
    loadDoctors();
  }, [teacherId, school]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('school', school)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('school', school)
        .eq('role', 'doctor');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const assignDoctor = async (sessionId: string, doctorId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          doctor_id: doctorId, 
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      await loadSessions();
      
      toast({
        title: "Success",
        description: "Doctor assigned to chat session",
      });
    } catch (error) {
      console.error('Error assigning doctor:', error);
      toast({
        title: "Error",
        description: "Failed to assign doctor",
        variant: "destructive",
      });
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      await loadSessions();
      
      toast({
        title: "Success",
        description: "Chat session ended",
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  return {
    sessions,
    doctors,
    isLoading,
    assignDoctor,
    endSession,
    loadSessions
  };
};
