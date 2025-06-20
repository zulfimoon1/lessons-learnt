
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlusIcon, CreditCardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InviteTeacherFormProps {
  school: string;
  subscriptionId?: string;
  hasActiveSubscription: boolean;
  onInviteSent?: () => void;
}

const InviteTeacherForm = ({ school, subscriptionId, hasActiveSubscription, onInviteSent }: InviteTeacherFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if this is a demo school
  const isDemoSchool = school?.toLowerCase().includes('demo') || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow demo schools to bypass subscription check
    if (!hasActiveSubscription && !isDemoSchool) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to invite teachers.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating invitation for:', { email, school, subscriptionId, isDemoSchool });

      // For demo schools, create a mock invitation
      if (isDemoSchool) {
        // Simulate successful invitation for demo
        toast({
          title: "Demo Invitation Created",
          description: `Demo invitation sent to ${email}. In a real environment, this would send an actual email invitation.`,
          variant: "default",
        });
        setEmail('');
        onInviteSent?.();
        return;
      }

      // Create invitation record for real schools
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          email: email.trim().toLowerCase(),
          school,
          role: 'teacher',
          subscription_id: subscriptionId,
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
        throw inviteError;
      }

      console.log('Invitation created:', invitation);

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-teacher-invitation', {
        body: {
          email: email.trim().toLowerCase(),
          school,
          inviteToken: invitation.invite_token,
        },
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Invitation Created",
          description: `Invitation created for ${email}, but email sending failed. Please share the invitation link manually.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invitation Sent",
          description: `Successfully sent invitation to ${email}`,
          variant: "default",
        });
      }

      setEmail('');
      onInviteSent?.();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: `Failed to send invitation: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasActiveSubscription && !isDemoSchool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Subscription Required
          </CardTitle>
          <CardDescription>
            You need an active subscription to invite teachers to {school}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Subscribe Now to Invite Teachers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlusIcon className="w-5 h-5" />
          Invite Teacher
          {isDemoSchool && <Badge variant="secondary">Demo Mode</Badge>}
        </CardTitle>
        <CardDescription>
          Send an invitation to a teacher to join {school}
          {isDemoSchool && " (Demo mode - no actual emails will be sent)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Teacher Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Sending Invitation...' : isDemoSchool ? 'Send Demo Invitation' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteTeacherForm;
