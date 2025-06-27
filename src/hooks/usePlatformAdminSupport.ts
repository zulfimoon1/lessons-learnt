
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
      // Create a notification entry
      const { data, error } = await supabase
        .from('in_app_notifications')
        .insert({
          recipient_email: 'zulfimoon1@gmail.com',
          recipient_type: 'platform_admin',
          title: `Support Request: ${params.subject}`,
          message: `From ${params.userName} (${params.userSchool}): ${params.message}`,
          notification_type: 'support_request'
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your support request has been sent to the platform admin.",
      });

      return data;
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
      // For now, return empty array until platform admin messages table is available
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
