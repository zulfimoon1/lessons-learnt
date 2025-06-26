
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionActionResult {
  success: boolean;
  action: string;
  new_status: string;
  transaction_id: string;
  requires_payment?: boolean;
  payment_initiated?: boolean;
  checkout_url?: string;
  payment_intent_id?: string;
}

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
      console.log('Processing transaction action:', { transactionId, action, adminEmail });

      // First, perform the transaction action
      const { data, error } = await supabase.rpc('school_admin_transaction_action', {
        transaction_id_param: transactionId,
        school_admin_email_param: adminEmail,
        action_param: action,
        comments_param: comments || null
      });

      if (error) throw error;
      
      console.log('Transaction action completed:', data);

      // Parse the JSON response with proper type checking
      const actionResult = data as unknown as TransactionActionResult;

      // If transaction was approved, trigger automatic payment processing
      if (action === 'approved' && actionResult?.requires_payment) {
        console.log('Triggering automatic payment processing...');
        
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
            'process-transaction-payment',
            {
              body: {
                transaction_id: transactionId,
                school_admin_email: adminEmail
              }
            }
          );

          if (paymentError) {
            console.error('Payment processing error:', paymentError);
            throw new Error(`Payment processing failed: ${paymentError.message}`);
          }

          console.log('Payment processing initiated:', paymentData);

          // If we have a checkout URL, open it in a new tab
          if (paymentData?.checkout_url) {
            window.open(paymentData.checkout_url, '_blank');
          }

          // Show success message with payment info
          const result: TransactionActionResult = {
            ...actionResult,
            payment_initiated: true,
            checkout_url: paymentData?.checkout_url,
            payment_intent_id: paymentData?.payment_intent_id
          };

          // Refresh pending transactions after action
          await fetchPendingTransactions(adminEmail);
          
          return result;

        } catch (paymentError) {
          console.error('Failed to initiate payment processing:', paymentError);
          // Still refresh transactions even if payment processing fails
          await fetchPendingTransactions(adminEmail);
          throw new Error(`Transaction approved but payment processing failed: ${paymentError}`);
        }
      }
      
      // Refresh pending transactions after action
      await fetchPendingTransactions(adminEmail);
      
      return actionResult;
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
