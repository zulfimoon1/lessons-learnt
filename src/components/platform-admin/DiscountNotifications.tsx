
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangleIcon, BellIcon, CheckIcon, RefreshCwIcon, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

interface PaymentNotification {
  id: string;
  subscription_id: string;
  school_name: string;
  admin_email: string;
  notification_type: string;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}

interface DiscountNotificationsProps {
  adminEmail?: string;
}

const DiscountNotifications = ({ adminEmail }: DiscountNotificationsProps) => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [securityValidated, setSecurityValidated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const validateSecurityAndFetch = async () => {
      try {
        // Enhanced security validation for admin operations
        const isValidSession = await enhancedSecurityService.validateSession();
        if (!isValidSession) {
          toast({
            title: "Security Error",
            description: "Session expired. Please log in again.",
            variant: "destructive"
          });
          return;
        }

        if (!adminEmail) {
          await enhancedSecurityService.logSecurityEvent(
            'unauthorized_admin_access',
            'Attempt to access discount notifications without admin email',
            'high'
          );
          return;
        }

        setSecurityValidated(true);
        await fetchNotifications();
      } catch (error) {
        console.error('Security validation error:', error);
        toast({
          title: "Security Error",
          description: "Unable to validate security credentials",
          variant: "destructive"
        });
      }
    };

    validateSecurityAndFetch();
  }, [adminEmail]);

  const fetchNotifications = async () => {
    try {
      if (!securityValidated) return;

      await enhancedSecurityService.logSecurityEvent(
        'payment_notifications_accessed',
        `Admin ${adminEmail} accessed payment notifications`,
        'low'
      );

      const { data, error } = await supabase
        .from('payment_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      await enhancedSecurityService.logSecurityEvent(
        'payment_notifications_error',
        `Error fetching payment notifications: ${error}`,
        'medium'
      );
      
      toast({
        title: "Error",
        description: "Failed to fetch payment notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processDiscountExpirations = async () => {
    if (!securityValidated) return;

    setIsProcessing(true);
    try {
      // Validate session before sensitive operation
      const isValidSession = await enhancedSecurityService.validateSession();
      if (!isValidSession) {
        toast({
          title: "Session Expired",
          description: "Please log in again to perform this action",
          variant: "destructive"
        });
        return;
      }

      await enhancedSecurityService.logSecurityEvent(
        'discount_expiration_process_initiated',
        `Admin ${adminEmail} initiated discount expiration processing`,
        'medium'
      );

      const { error } = await supabase.functions.invoke('process-discount-expirations');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Discount expirations processed successfully"
      });
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error processing discount expirations:', error);
      
      await enhancedSecurityService.logSecurityEvent(
        'discount_expiration_process_error',
        `Error processing discount expirations: ${error}`,
        'high'
      );
      
      toast({
        title: "Error",
        description: "Failed to process discount expirations",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'discount_ending':
        return <AlertTriangleIcon className="w-4 h-4 text-orange-500" />;
      case 'payment_due':
        return <BellIcon className="w-4 h-4 text-red-500" />;
      default:
        return <BellIcon className="w-4 h-4" />;
    }
  };

  const getNotificationBadge = (type: string, sentAt: string | null) => {
    if (sentAt) {
      return <Badge variant="secondary"><CheckIcon className="w-3 h-3 mr-1" />Sent</Badge>;
    }
    
    switch (type) {
      case 'discount_ending':
        return <Badge variant="outline" className="text-orange-600">Discount Ending</Badge>;
      case 'payment_due':
        return <Badge variant="destructive">Payment Due</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (!securityValidated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Security Validation Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Validating security credentials...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Payment Notifications
            <Badge variant="outline" className="ml-2">
              Secure Access
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={fetchNotifications}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={processDiscountExpirations}
              disabled={isProcessing}
              size="sm"
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
              ) : (
                <BellIcon className="w-4 h-4" />
              )}
              Process Expirations
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payment notifications found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.notification_type)}
                      {notification.notification_type.replace('_', ' ').toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {notification.school_name}
                  </TableCell>
                  <TableCell>{notification.admin_email}</TableCell>
                  <TableCell>
                    {new Date(notification.scheduled_for).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getNotificationBadge(notification.notification_type, notification.sent_at)}
                  </TableCell>
                  <TableCell>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountNotifications;
