
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlusIcon } from "lucide-react";

interface InviteTeacherFormProps {
  school: string;
  subscriptionId?: string;
  onInviteSent?: () => void;
}

const InviteTeacherForm = ({ school, subscriptionId, onInviteSent }: InviteTeacherFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.log('Creating invitation for:', { email, school, subscriptionId });

      // Create invitation record
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
        // Don't throw here - invitation was created successfully
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlusIcon className="w-5 h-5" />
          Invite Teacher
        </CardTitle>
        <CardDescription>
          Send an invitation to a teacher to join {school}
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
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteTeacherForm;
