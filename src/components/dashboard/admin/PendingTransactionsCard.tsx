
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
  AlertTriangleIcon
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
      await handleTransactionAction(selectedTransaction, adminEmail, actionType, comments);
      
      toast({
        title: "Success",
        description: `Transaction ${actionType} successfully.`,
      });
      
      setSelectedTransaction(null);
      setActionType(null);
      setComments('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionType} transaction.`,
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
            Review and approve/reject pending transactions for {schoolName}
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
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="w-4 h-4" />
                          <span className="font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                          <Badge variant="outline">{transaction.transaction_type}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="w-3 h-3" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                      
                      {transaction.description && (
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          onClick={() => handleActionClick(transaction.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Approve
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
              {actionType === 'approved' ? 'Approve Transaction' : 'Reject Transaction'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
              {isProcessing ? 'Processing...' : `${actionType === 'approved' ? 'Approve' : 'Reject'} Transaction`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingTransactionsCard;
