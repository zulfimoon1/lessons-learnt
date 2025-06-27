
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
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      // Try to call the RPC function if it exists, otherwise fall back to direct insert
      try {
        const { data, error } = await supabase.rpc('create_platform_admin_message' as any, {
          subject_param: params.subject,
          message_param: params.message,
          category_param: params.category,
          sender_email_param: params.userEmail,
          sender_name_param: params.userName,
          sender_role_param: params.userRole,
          sender_school_param: params.userSchool,
          user_agent_param: navigator.userAgent,
          browser_info_param: browserInfo
        });

        if (error) throw error;

        toast({
          title: "Message Sent",
          description: "Your support request has been sent to the platform admin.",
        });

        return data;
      } catch (rpcError) {
        console.log('RPC function not available, falling back to notification creation');
        
        // Fallback: Create a notification entry
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
      }
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
      // Try to query the platform_admin_messages table if it exists
      try {
        const { data, error } = await (supabase as any)
          .from('platform_admin_messages')
          .select('*')
          .eq('sender_email', userEmail)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMessages(data || []);
        return data;
      } catch (tableError) {
        console.log('Platform admin messages table not available yet');
        
        // Fallback: Return empty array until migration is run
        setMessages([]);
        return [];
      }
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
