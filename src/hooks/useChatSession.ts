
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveChatSession } from "@/types/auth";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'student' | 'doctor';
  sender_name: string;
  message: string;
  sent_at: string;
}

export const useChatSession = (session: LiveChatSession, isDoctorView: boolean, studentName: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);

  useEffect(() => {
    console.log('useChatSession: Setting up chat for session:', session.id);
    loadMessages();
    setupRealtimeSubscription();
    
    if (session.status === 'active' && session.doctor_id) {
      setIsConnected(true);
      if (!isDoctorView) {
        loadDoctorInfo(session.doctor_id);
      }
    }

    if (isDoctorView && !session.doctor_id) {
      notifyStudentDoctorJoined();
    }

    return () => {
      console.log('useChatSession: Cleaning up chat subscription');
    };
  }, [session.id]);

  const loadMessages = async () => {
    try {
      console.log('useChatSession: Loading messages for session:', session.id);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      console.log('useChatSession: Loaded messages:', data);
      
      // Transform data to ensure proper typing
      const typedMessages: ChatMessage[] = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'student' | 'doctor'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('useChatSession: Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('useChatSession: Setting up real-time subscription');
    const channel = supabase
      .channel(`chat_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('useChatSession: New message received:', payload);
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'student' | 'doctor'
          } as ChatMessage;
          setMessages(current => [...current, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('useChatSession: Session updated:', payload);
          if (payload.new.status === 'active' && payload.new.doctor_id) {
            setIsConnected(true);
            if (!isDoctorView) {
              loadDoctorInfo(payload.new.doctor_id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('useChatSession: Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadDoctorInfo = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('name, email')
        .eq('id', doctorId)
        .eq('role', 'doctor')
        .single();

      if (error) throw error;
      console.log('useChatSession: Loaded doctor info:', data);
      setDoctorInfo(data);
    } catch (error) {
      console.error('useChatSession: Error loading doctor info:', error);
    }
  };

  const notifyStudentDoctorJoined = async () => {
    try {
      console.log('useChatSession: Sending doctor joined notification');
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: 'doctor',
          sender_name: 'System',
          message: `Dr. ${studentName} has joined the conversation. How can I help you today?`
        });

      if (error) throw error;
    } catch (error) {
      console.error('useChatSession: Error sending doctor joined notification:', error);
    }
  };

  const sendMessage = async (message: string, isAnonymous: boolean) => {
    if (!message.trim()) return;

    try {
      console.log('useChatSession: Sending message:', message);
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: isDoctorView ? 'doctor' : 'student',
          sender_name: isDoctorView ? `Dr. ${studentName}` : (isAnonymous ? 'Anonymous Student' : studentName),
          message: message.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('useChatSession: Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
