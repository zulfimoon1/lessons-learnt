
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUpIcon } from "lucide-react";

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  currency: string;
  current_period_end: string;
  created_at: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
}

interface SubscriptionManagementProps {
  subscriptions: Subscription[];
}

const SubscriptionManagement = ({ subscriptions }: SubscriptionManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>Monitor and manage school subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.school_name}</TableCell>
                  <TableCell>{subscription.plan_type}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'destructive'}
                    >
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${(subscription.amount / 100).toFixed(2)} {subscription.currency?.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {subscription.current_period_end ? 
                      new Date(subscription.current_period_end).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {subscription.stripe_customer_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No subscriptions found in the database</p>
            <p className="text-xs text-muted-foreground mt-2">
              This could mean subscriptions haven't been created yet or there's an issue with data storage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
