
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUpIcon,
  FilterIcon,
  PauseIcon,
  PlayIcon,
  AlertTriangleIcon,
  SchoolIcon,
  CalendarIcon,
  DollarSignIcon
} from "lucide-react";

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  created_at: string;
  updated_at: string;
}

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const { isAuthenticated, admin } = usePlatformAdmin();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [renewalWarnings, setRenewalWarnings] = useState<Subscription[]>([]);

  useEffect(() => {
    if (isAuthenticated && admin) {
      loadSubscriptionData();
    }
  }, [isAuthenticated, admin]);

  const loadSubscriptionData = async () => {
    try {
      console.log('=== LOADING SUBSCRIPTION DATA ===');
      console.log('Platform admin:', admin);

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        toast({
          title: "Error",
          description: `Failed to load subscriptions: ${subscriptionsError.message}`,
          variant: "destructive",
        });
        return;
      }

      setSubscriptions(subscriptionsData || []);

      // Check for renewal warnings (subscriptions ending in next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const warnings = (subscriptionsData || []).filter(sub => {
        if (!sub.current_period_end) return false;
        const endDate = new Date(sub.current_period_end);
        return endDate <= thirtyDaysFromNow && sub.status === 'active';
      });
      
      setRenewalWarnings(warnings);
      
      console.log('Subscriptions loaded successfully:', subscriptionsData?.length || 0);
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: `Failed to load subscription data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'paused' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription paused successfully",
      });
      
      loadSubscriptionData();
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to pause subscription",
        variant: "destructive",
      });
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription resumed successfully",
      });
      
      loadSubscriptionData();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: "Failed to resume subscription",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (selectedSchool !== "all" && sub.school_name !== selectedSchool) return false;
    return true;
  });

  const uniqueSchools = Array.from(new Set(subscriptions.map(sub => sub.school_name)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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
              <TrendingUpIcon className="w-5 h-5" />
              Subscription Management
            </CardTitle>
            <CardDescription>Manage school subscriptions and renewals</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangleIcon className="w-3 h-3 mr-1" />
              {renewalWarnings.length} renewals due
            </Badge>
          </div>
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

        {/* Renewal Warnings */}
        {renewalWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4" />
              Subscription Renewal Warnings
            </h4>
            <div className="space-y-2">
              {renewalWarnings.map((sub) => (
                <div key={sub.id} className="text-sm text-yellow-700">
                  <strong>{sub.school_name}</strong> - {sub.plan_type} plan expires on {formatDate(sub.current_period_end)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscriptions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Next Renewal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="w-4 h-4" />
                    {subscription.school_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {subscription.plan_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSignIcon className="w-3 h-3" />
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 
                           subscription.status === 'paused' ? 'secondary' : 'destructive'}
                  >
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <CalendarIcon className="w-3 h-3" />
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </div>
                </TableCell>
                <TableCell>
                  {subscription.current_period_end && (
                    <span className={`text-sm ${
                      new Date(subscription.current_period_end) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                        ? 'text-yellow-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {formatDate(subscription.current_period_end)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {subscription.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseSubscription(subscription.id)}
                      >
                        <PauseIcon className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    ) : subscription.status === 'paused' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResumeSubscription(subscription.id)}
                      >
                        <PlayIcon className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No subscriptions found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
