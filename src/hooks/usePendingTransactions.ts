
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export const usePendingTransactions = () => {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingTransactions = useCallback(async (adminEmail: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_school_pending_transactions', {
        school_admin_email_param: adminEmail
      });

      if (error) throw error;
      setPendingTransactions(data || []);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setPendingTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTransactionAction = useCallback(async (
    transactionId: string,
    adminEmail: string,
    action: 'approved' | 'rejected' | 'requested_changes',
    comments?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('school_admin_transaction_action', {
        transaction_id_param: transactionId,
        school_admin_email_param: adminEmail,
        action_param: action,
        comments_param: comments || null
      });

      if (error) throw error;
      
      // Refresh pending transactions after action
      await fetchPendingTransactions(adminEmail);
      
      return data;
    } catch (error) {
      console.error('Error handling transaction action:', error);
      throw error;
    }
  }, [fetchPendingTransactions]);

  return {
    pendingTransactions,
    isLoading,
    fetchPendingTransactions,
    handleTransactionAction
  };
};
