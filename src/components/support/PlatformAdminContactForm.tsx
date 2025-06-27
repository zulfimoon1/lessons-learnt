
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquareIcon, 
  SendIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  HeadphonesIcon,
  LoaderIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlatformAdminContactFormProps {
  userEmail: string;
  userName: string;
  userRole: string;
  userSchool: string;
  className?: string;
}

const PlatformAdminContactForm: React.FC<PlatformAdminContactFormProps> = ({
  userEmail,
  userName,
  userRole,
  userSchool,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: ''
  });

  const { toast } = useToast();

  const categories = [
    { value: 'technical', label: 'Technical Issues', description: 'Login problems, bugs, system errors' },
    { value: 'billing', label: 'Billing & Subscriptions', description: 'Payment issues, subscription questions' },
    { value: 'feature_request', label: 'Feature Requests', description: 'Suggestions for new features or improvements' },
    { value: 'urgent', label: 'Urgent Support', description: 'Critical issues requiring immediate attention' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        timestamp: new Date().toISOString()
      };

      // Try to call the RPC function, fall back to notification if not available
      try {
        const { data, error } = await supabase.rpc('create_platform_admin_message' as any, {
          subject_param: formData.subject,
          message_param: formData.message,
          category_param: formData.category,
          sender_email_param: userEmail,
          sender_name_param: userName,
          sender_role_param: userRole,
          sender_school_param: userSchool,
          user_agent_param: navigator.userAgent,
          browser_info_param: browserInfo
        });

        if (error) throw error;
      } catch (rpcError) {
        console.log('RPC function not available, using fallback method');
        
        // Fallback: Create notification
        const { data, error } = await supabase
          .from('in_app_notifications')
          .insert({
            recipient_email: 'zulfimoon1@gmail.com',
            recipient_type: 'platform_admin',
            title: `Support Request: ${formData.subject}`,
            message: `From ${userName} (${userSchool}, ${userRole}): ${formData.message}. Category: ${formData.category}`,
            notification_type: 'support_request'
          });

        if (error) throw error;
      }

      setSubmitted(true);
      setFormData({ subject: '', message: '', category: '' });
      
      toast({
        title: "Message Sent Successfully",
        description: "Your support request has been sent to the platform admin. You'll receive a response soon.",
      });

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (category: string) => {
    switch (category) {
      case 'urgent':
        return <Badge variant="destructive">Critical Priority</Badge>;
      case 'billing':
        return <Badge className="bg-orange-100 text-orange-800">High Priority</Badge>;
      case 'technical':
        return <Badge className="bg-blue-100 text-blue-800">Medium Priority</Badge>;
      default:
        return <Badge variant="secondary">Low Priority</Badge>;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
      >
        <HeadphonesIcon className="w-4 h-4" />
        Contact Platform Support
      </Button>
    );
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareIcon className="w-5 h-5 text-primary" />
          Contact Platform Admin
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>Get direct support from the platform administrator</p>
          <div className="mt-2 space-y-1">
            <p><strong>Your Email:</strong> {userEmail}</p>
            <p><strong>School:</strong> {userSchool}</p>
            <p><strong>Role:</strong> {userRole}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {submitted ? (
          <Alert>
            <CheckCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Your message has been sent successfully! The platform admin will respond to your email within 24 hours.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the type of issue" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{category.label}</span>
                        <span className="text-xs text-muted-foreground">{category.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category && (
                <div className="flex items-center gap-2">
                  {getPriorityBadge(formData.category)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.subject.length}/200 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce the problem, or specific questions you have."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                maxLength={2000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.message.length}/2000 characters
              </div>
            </div>

            {formData.category === 'urgent' && (
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Urgent requests</strong> are for critical issues that prevent you from using the platform. 
                  For non-critical issues, please use the appropriate category to ensure faster resolution.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim() || !formData.category}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformAdminContactForm;
