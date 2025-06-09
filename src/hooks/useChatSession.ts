
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LiveChatSession } from '@/types/auth';

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

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'student' | 'doctor';
  sender_name: string;
  message: string;
  sent_at: string;
}

interface DoctorInfo {
  name: string;
  id: string;
}

// Hook for chat session management (admin/teacher view)
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

// Hook for real-time chat functionality (used in RealtimeChat component)
export const useRealtimeChatSession = (session: LiveChatSession, isDoctorView: boolean, studentName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadDoctorInfo();
    
    // Set up real-time subscription for messages
    const messageSubscription = supabase
      .channel('chat-messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [session.id]);

  useEffect(() => {
    setIsConnected(session.status === 'active');
  }, [session.status]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadDoctorInfo = async () => {
    if (session.doctor_id) {
      try {
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select('name, id')
          .eq('id', session.doctor_id)
          .single();

        if (error) throw error;
        setDoctorInfo(data);
      } catch (error) {
        console.error('Error loading doctor info:', error);
      }
    }
  };

  const sendMessage = async (message: string, isAnonymous: boolean) => {
    if (!message.trim()) return;

    try {
      const senderName = isDoctorView 
        ? (doctorInfo?.name || 'Doctor')
        : (isAnonymous ? 'Anonymous Student' : studentName);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: isDoctorView ? 'doctor' : 'student',
          sender_name: senderName,
          message: message.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    isConnected,
    doctorInfo,
    sendMessage
  };
};
