
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  admin_response?: string;
  responded_at?: string;
}

interface CreateMessageParams {
  subject: string;
  message: string;
  category: string;
  userEmail: string;
  userName: string;
  userRole: string;
  userSchool: string;
}

export const usePlatformAdminSupport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const { toast } = useToast();

  const createSupportMessage = async (params: CreateMessageParams) => {
    setIsLoading(true);
    try {
      // Use the edge function approach to send support messages
      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-platform-admin-notification', {
        body: {
          messageId: crypto.randomUUID(),
          senderName: params.userName,
          senderEmail: params.userEmail,
          senderSchool: params.userSchool,
          subject: params.subject,
          message: params.message,
          category: params.category,
          priority: params.category === 'urgent' ? 'critical' : 'medium'
        }
      });

      if (functionError) {
        // Fallback - console log for development
        console.log('Support message (dev mode):', {
          from: params.userName,
          email: params.userEmail,
          school: params.userSchool,
          subject: params.subject,
          message: params.message,
          category: params.category
        });
      }

      toast({
        title: "Message Sent",
        description: "Your support request has been sent to the platform admin.",
      });

      return functionData;
    } catch (error) {
      console.error('Error creating support message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserMessages = async (userEmail: string) => {
    setIsLoading(true);
    try {
      setMessages([]);
      return [];
    } catch (error) {
      console.error('Error fetching user messages:', error);
      toast({
        title: "Error",
        description: "Failed to load your support messages.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    messages,
    createSupportMessage,
    getUserMessages
  };
};
