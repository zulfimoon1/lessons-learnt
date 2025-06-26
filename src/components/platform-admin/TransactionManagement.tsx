import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { securePlatformAdminService } from "@/services/securePlatformAdminService";
import { supabase } from "@/integrations/supabase/client";
import { 
  PlusIcon, 
  CreditCardIcon,
  DollarSignIcon,
  CalendarIcon,
  FilterIcon,
  InfoIcon,
  UsersIcon,
  CalculatorIcon,
  TrashIcon
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { calculatePricing } from "@/services/pricingService";

type Transaction = Database['public']['Tables']['transactions']['Row'];

const TransactionManagement = () => {
  const { toast } = useToast();
  const { isAuthenticated, admin } = usePlatformAdmin();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [formData, setFormData] = useState({
    school_name: '',
    amount: '',
    currency: 'eur',
    transaction_type: 'payment',
    status: 'completed',
    description: '',
    teacher_count: '',
    subscription_type: 'monthly',
    tier_type: 'teacher'
  });

  useEffect(() => {
    if (isAuthenticated && admin) {
      loadTransactions();
    }
  }, [isAuthenticated, admin]);

  const loadTransactions = async () => {
    try {
      console.log('=== LOADING TRANSACTIONS VIA ADMIN SERVICE ===');

      if (!admin?.email) {
        console.error('No admin email available');
        setTransactions([]);
        return;
      }

      // Use the secure admin service instead of direct Supabase calls
      const result = await securePlatformAdminService.getTransactions(admin.email);
      setTransactions(result || []);
      console.log('Transactions loaded successfully:', result?.length || 0);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTransactionAmount = () => {
    if (!formData.teacher_count || !formData.tier_type) return 0;
    
    const teacherCount = parseInt(formData.teacher_count);
    const isAnnual = formData.subscription_type === 'annual';
    
    try {
      const pricing = calculatePricing(formData.tier_type as 'teacher' | 'admin', teacherCount, isAnnual);
      return pricing.finalPrice;
    } catch (error) {
      return 0;
    }
  };

  const handleCalculateAmount = () => {
    const calculatedAmount = calculateTransactionAmount();
    if (calculatedAmount > 0) {
      setFormData({
        ...formData,
        amount: (calculatedAmount / 100).toFixed(2) // Convert from cents to euros
      });
    }
  };

  const sendTransactionNotification = async (transactionId: string, schoolName: string) => {
    try {
      // Find school admin email
      const { data: schoolAdmins, error } = await supabase
        .from('teachers')
        .select('email')
        .eq('school', schoolName)
        .eq('role', 'admin')
        .limit(1);

      if (error || !schoolAdmins || schoolAdmins.length === 0) {
        console.log('No school admin found for notification');
        return;
      }

      const adminEmail = schoolAdmins[0].email;

      // Create in-app notification
      await supabase
        .from('in_app_notifications')
        .insert({
          recipient_email: adminEmail,
          recipient_type: 'school_admin',
          title: 'New Pending Transaction',
          message: `A new transaction requires your review and approval for ${schoolName}`,
          notification_type: 'pending_transaction',
          related_id: transactionId
        });

      console.log('Notification sent to school admin:', adminEmail);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleCreate = async () => {
    if (!admin) {
      toast({
        title: "Error",
        description: "You must be logged in as an admin",
        variant: "destructive",
      });
      return;
    }

    if (!formData.school_name.trim() || !formData.amount.trim()) {
      toast({
        title: "Error",
        description: "School name and amount are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Build description with subscription details
      let description = formData.description.trim();
      if (formData.teacher_count && formData.subscription_type) {
        const subscriptionDetails = `${formData.teacher_count} ${formData.tier_type}(s) - ${formData.subscription_type} subscription`;
        description = description ? `${description} (${subscriptionDetails})` : subscriptionDetails;
      }

      // Use the secure admin service to create transaction
      const result = await securePlatformAdminService.createTransaction(admin.email, {
        school_name: formData.school_name.trim(),
        amount: formData.amount,
        currency: formData.currency,
        transaction_type: formData.transaction_type,
        status: formData.status,
        description: description
      });

      if (result) {
        // Send notification if status is pending
        if (formData.status === 'pending') {
          await sendTransactionNotification(result.id, formData.school_name.trim());
        }

        toast({
          title: "Success",
          description: formData.status === 'pending' 
            ? "Transaction created and school admin has been notified for approval."
            : "Manual transaction created successfully. School admins can view this in their subscription management section.",
        });

        resetForm();
        setIsCreateDialogOpen(false);
        loadTransactions();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create transaction",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      school_name: '',
      amount: '',
      currency: 'eur',
      transaction_type: 'payment',
      status: 'completed',
      description: '',
      teacher_count: '',
      subscription_type: 'monthly',
      tier_type: 'teacher'
    });
  };

  const handleDelete = async (transactionId: string) => {
    if (!admin?.email) {
      toast({
        title: "Error",
        description: "You must be logged in as an admin",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }

    try {
      await securePlatformAdminService.deleteTransaction(admin.email, transactionId);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      loadTransactions(); // Reload the transactions list
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedSchool !== "all" && transaction.school_name !== selectedSchool) return false;
    return true;
  });

  const uniqueSchools = Array.from(new Set(transactions.map(t => t.school_name)));

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">Access Denied</div>
            <p className="text-gray-600">Please log in as a platform administrator</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Transaction Management
            </CardTitle>
            <CardDescription>Manually add and manage financial transactions</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Manually add a transaction record. If marked as "Pending", school admins will receive a notification to approve/reject it.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Transaction Status Options:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Pending:</strong> Requires school admin approval (notification sent automatically)</li>
                      <li><strong>Completed:</strong> Processed transaction (appears in their subscription history)</li>
                      <li><strong>Failed:</strong> Failed or rejected transaction</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="school_name">School Name *</Label>
                    <Input
                      id="school_name"
                      value={formData.school_name}
                      onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                      placeholder="Enter school name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tier_type">Account Type</Label>
                    <Select value={formData.tier_type} onValueChange={(value) => setFormData({...formData, tier_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher Account</SelectItem>
                        <SelectItem value="admin">Admin Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="teacher_count">Number of Teachers</Label>
                    <Input
                      id="teacher_count"
                      type="number"
                      min="1"
                      value={formData.teacher_count}
                      onChange={(e) => setFormData({...formData, teacher_count: e.target.value})}
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subscription_type">Subscription Type</Label>
                    <Select value={formData.subscription_type} onValueChange={(value) => setFormData({...formData, subscription_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCalculateAmount}
                      disabled={!formData.teacher_count}
                      className="w-full flex items-center gap-2"
                    >
                      <CalculatorIcon className="w-4 h-4" />
                      Calculate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount * (EUR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transaction_type">Transaction Type</Label>
                    <Select value={formData.transaction_type} onValueChange={(value) => setFormData({...formData, transaction_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending (Requires Approval)</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional transaction notes"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Transaction'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {uniqueSchools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-500" />
                    {transaction.school_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSignIcon className="w-3 h-3" />
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {transaction.transaction_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={transaction.status === 'completed' ? 'default' : 
                           transaction.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {formatDate(transaction.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Create your first transaction to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionManagement;
