
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUpIcon,
  PauseIcon,
  PlayIcon,
  AlertTriangleIcon,
  CalendarIcon,
  DollarSignIcon
} from "lucide-react";

interface SchoolSubscription {
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

interface SchoolSubscriptionManagementProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const SchoolSubscriptionManagement: React.FC<SchoolSubscriptionManagementProps> = ({ teacher }) => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewalWarning, setIsRenewalWarning] = useState(false);

  useEffect(() => {
    loadSchoolSubscription();
  }, [teacher.school]);

  const loadSchoolSubscription = async () => {
    try {
      console.log('Loading subscription for school:', teacher.school);

      // Fetch school-specific subscription
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading subscription:', error);
        throw error;
      }

      setSubscription(subscriptionData);

      // Check for renewal warning (subscription ending in next 30 days)
      if (subscriptionData?.current_period_end) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const endDate = new Date(subscriptionData.current_period_end);
        setIsRenewalWarning(endDate <= thirtyDaysFromNow && subscriptionData.status === 'active');
      }
      
      console.log('School subscription loaded:', subscriptionData);
      
    } catch (error) {
      console.error('Error loading school subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    if (!subscription) return;

    try {
      // This would typically call a Stripe API or edge function
      // For now, we'll update the local status
      toast({
        title: "Feature Coming Soon",
        description: "Subscription pause functionality will be available soon. Please contact support for assistance.",
      });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to pause subscription",
        variant: "destructive",
      });
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      // This would typically call a Stripe API or edge function
      toast({
        title: "Feature Coming Soon",
        description: "Subscription resume functionality will be available soon. Please contact support for assistance.",
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: "Failed to resume subscription",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            School Subscription
          </CardTitle>
          <CardDescription>
            Manage your school's subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active subscription found for {teacher.school}</p>
            <Button onClick={() => window.open('/pricing', '_blank')}>
              View Pricing Plans
            </Button>
          </div>
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
              School Subscription Management
            </CardTitle>
            <CardDescription>
              Manage subscription for {teacher.school}
            </CardDescription>
          </div>
          {isRenewalWarning && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertTriangleIcon className="w-3 h-3 mr-1" />
              Renewal Due Soon
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Renewal Warning */}
        {isRenewalWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4" />
              Subscription Renewal Notice
            </h4>
            <p className="text-sm text-yellow-700">
              Your subscription for <strong>{subscription.plan_type}</strong> plan expires on {formatDate(subscription.current_period_end)}. 
              Please ensure your payment method is up to date to avoid service interruption.
            </p>
          </div>
        )}

        {/* Subscription Details Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Next Renewal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
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
                <span className={`text-sm ${
                  isRenewalWarning 
                    ? 'text-yellow-600 font-medium' 
                    : 'text-gray-600'
                }`}>
                  {formatDate(subscription.current_period_end)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {subscription.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseSubscription}
                    >
                      <PauseIcon className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  ) : subscription.status === 'paused' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResumeSubscription}
                    >
                      <PlayIcon className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        {/* Holiday Pause Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Holiday Pause Options</h4>
          <p className="text-sm text-blue-700 mb-3">
            You can pause your subscription during school holidays (summer break, winter break, etc.) 
            to avoid charges when the service isn't being used.
          </p>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            Schedule Holiday Pause
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolSubscriptionManagement;
