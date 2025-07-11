
import { useState, useEffect, useRef } from "react";
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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('useChatSession: Initializing for session:', session);
    console.log('useChatSession: Session details:', {
      id: session.id,
      student_id: session.student_id,
      status: session.status,
      grade: session.grade
    });
    
    // Initialize chat
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

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('useChatSession: Cleaning up subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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

      if (error) {
        console.error('useChatSession: Error loading messages:', error);
        throw error;
      }
      
      const typedMessages: ChatMessage[] = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'student' | 'doctor'
      }));
      
      console.log('useChatSession: Loaded messages:', typedMessages.length);
      setMessages(typedMessages);
    } catch (error) {
      console.error('useChatSession: Failed to load messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('useChatSession: Setting up realtime subscription');
    
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const channelName = `chat_${session.id}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
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

    channelRef.current = channel;
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
      console.log('useChatSession: Sending message to session:', session.id);
      console.log('useChatSession: Message content:', message);
      console.log('useChatSession: Full session object:', session);
      
      // Verify session exists before sending message
      const { data: sessionExists, error: sessionError } = await supabase
        .from('live_chat_sessions')
        .select('id, status')
        .eq('id', session.id)
        .single();

      if (sessionError || !sessionExists) {
        console.error('useChatSession: Session not found during verification:', sessionError);
        console.log('useChatSession: Attempted to find session with ID:', session.id);
        throw new Error('Chat session not found. Please try again.');
      }
      
      console.log('useChatSession: Session exists, proceeding with message send:', sessionExists);
      
      // Prepare the message data
      const messageData = {
        session_id: session.id,
        sender_type: isDoctorView ? 'doctor' : 'student',
        sender_name: isDoctorView ? `Dr. ${studentName}` : (isAnonymous ? 'Anonymous Student' : studentName),
        message: message.trim().slice(0, 1000)
      };

      console.log('useChatSession: Inserting message with data:', messageData);

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('useChatSession: Database error:', error);
        if (error.code === '23503') {
          throw new Error('Session not ready. Please wait a moment and try again.');
        }
        throw error;
      }
      
      console.log('useChatSession: Message sent successfully');
    } catch (error) {
      console.error('useChatSession: Error sending message:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to send message. Please try again.');
    }
  };

  return {
    messages,
    isConnected,
    doctorInfo,
    sendMessage
  };
};
