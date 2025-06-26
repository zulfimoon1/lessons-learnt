
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  MessageSquareIcon,
  DollarSignIcon,
  CalendarIcon,
  AlertTriangleIcon,
  CreditCardIcon,
  ExternalLinkIcon
} from 'lucide-react';

interface PendingTransactionsCardProps {
  adminEmail: string;
  schoolName: string;
}

const PendingTransactionsCard: React.FC<PendingTransactionsCardProps> = ({ 
  adminEmail, 
  schoolName 
}) => {
  const { toast } = useToast();
  const { pendingTransactions, isLoading, fetchPendingTransactions, handleTransactionAction } = usePendingTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingTransactions(adminEmail);
  }, [adminEmail, fetchPendingTransactions]);

  const handleActionClick = (transactionId: string, action: 'approved' | 'rejected') => {
    setSelectedTransaction(transactionId);
    setActionType(action);
    setComments('');
  };

  const confirmAction = async () => {
    if (!selectedTransaction || !actionType) return;
    
    setIsProcessing(true);
    try {
      const result = await handleTransactionAction(selectedTransaction, adminEmail, actionType, comments);
      
      if (actionType === 'approved' && result?.payment_initiated) {
        toast({
          title: "Payment Processing Started",
          description: "Transaction approved and payment processing has been initiated. A new tab will open for payment completion.",
        });
      } else {
        toast({
          title: "Success",
          description: `Transaction ${actionType} successfully.`,
        });
      }
      
      setSelectedTransaction(null);
      setActionType(null);
      setComments('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${actionType} transaction`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentStatusBadge = (transaction: any) => {
    const paymentStatus = transaction.payment_status;
    
    if (!paymentStatus || paymentStatus === 'pending') {
      return <Badge variant="outline">Pending Approval</Badge>;
    }
    
    switch (paymentStatus) {
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Processing</Badge>;
      case 'requires_payment':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <CreditCardIcon className="w-3 h-3 mr-1" />
            Payment Required
          </Badge>
        );
      case 'paid':
        return <Badge variant="default" className="bg-green-50 text-green-700">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Payment Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Pending Transactions
            {pendingTransactions.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {pendingTransactions.length} pending
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve/reject pending transactions for {schoolName}. Approved transactions will automatically initiate Stripe payment processing.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No pending transactions</p>
              <p className="text-sm">All transactions are up to date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <Alert key={transaction.id} className="border-yellow-200 bg-yellow-50">
                  <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="w-4 h-4" />
                          <span className="font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                          <Badge variant="outline">{transaction.transaction_type}</Badge>
                          {getPaymentStatusBadge(transaction)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="w-3 h-3" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                      
                      {transaction.description && (
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      )}

                      {/* Show payment status info for approved transactions */}
                      {transaction.status === 'approved' && transaction.payment_status === 'requires_payment' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCardIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Payment Processing Required</span>
                          </div>
                          <p className="text-xs text-blue-700">
                            This transaction has been approved and requires payment completion via Stripe.
                          </p>
                        </div>
                      )}
                      
                      {/* Only show action buttons for truly pending transactions */}
                      {transaction.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            onClick={() => handleActionClick(transaction.id, 'approved')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approve & Process Payment
                          </Button>
                          <Button
                            onClick={() => handleActionClick(transaction.id, 'rejected')}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approve Transaction & Process Payment' : 'Reject Transaction'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approved' 
                ? 'Are you sure you want to approve this transaction? This will automatically initiate Stripe payment processing and open a payment window.' 
                : 'Are you sure you want to reject this transaction? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'approved' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCardIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Automatic Payment Processing</span>
                </div>
                <p className="text-xs text-blue-700">
                  Once approved, a Stripe checkout session will be created and opened in a new tab for payment completion.
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add a comment about why you ${actionType} this transaction...`}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isProcessing}
              className={actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'rejected' ? 'destructive' : 'default'}
            >
              {isProcessing ? 'Processing...' : 
               actionType === 'approved' ? 'Approve & Process Payment' : 'Reject Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingTransactionsCard;
