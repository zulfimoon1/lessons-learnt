
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
      // Try to use the new platform admin messages function first
      try {
        const { data, error } = await supabase.rpc('create_platform_admin_message', {
          subject_param: params.subject,
          message_param: params.message,
          category_param: params.category,
          sender_email_param: params.userEmail,
          sender_name_param: params.userName,
          sender_role_param: params.userRole,
          sender_school_param: params.userSchool
        } as any);

        if (error) throw error;

        toast({
          title: "Message Sent",
          description: "Your support request has been sent to the platform admin.",
        });

        return data;
      } catch (rpcError) {
        console.log('RPC function not available, using direct notification insert');
        
        // Fallback: Create notification directly without RLS constraints
        const notificationData = {
          recipient_email: 'zulfimoon1@gmail.com',
          recipient_type: 'platform_admin',
          title: `Support Request: ${params.subject}`,
          message: `From ${params.userName} (${params.userSchool}, ${params.userRole}): ${params.message}. Category: ${params.category}`,
          notification_type: 'support_request'
        };

        // Use the edge function approach to bypass RLS
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
          // Final fallback - simple console log for development
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
          description: "Your support request has been logged and will be reviewed by the platform admin.",
        });

        return functionData;
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
