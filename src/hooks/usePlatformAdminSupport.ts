
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const createSupportMessage = async (params: CreateMessageParams) => {
    setIsLoading(true);
    try {
      // Direct edge function call - simplified approach
      const { error } = await supabase.functions.invoke('send-platform-admin-notification', {
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

      if (error) {
        console.error('Support message error:', error);
      }

      toast({
        title: "Message Sent",
        description: "Your support request has been sent to the platform admin.",
      });

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

  return {
    isLoading,
    createSupportMessage
  };
};
