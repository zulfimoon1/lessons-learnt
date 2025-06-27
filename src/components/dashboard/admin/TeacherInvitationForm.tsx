
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

interface TeacherInvitationFormProps {
  school: string;
  onInvitationSent?: () => void;
}

const TeacherInvitationForm: React.FC<TeacherInvitationFormProps> = ({ 
  school, 
  onInvitationSent 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'teacher',
    specialization: ''
  });
  const { toast } = useToast();
  const { admin } = usePlatformAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started', { formData, school, admin });

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!admin?.email) {
      toast({
        title: "Error",
        description: "Platform admin authentication required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create invitation directly in the invitations table first
      console.log('📝 Creating invitation record directly...');
      
      const { data: invitation, error: createError } = await supabase
        .from('invitations')
        .insert({
          email: formData.email.trim().toLowerCase(),
          school: school,
          role: formData.role,
          specialization: formData.specialization || null,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Direct invitation creation error:', createError);
        throw new Error(`Failed to create invitation: ${createError.message}`);
      }

      console.log('✅ Invitation created directly:', invitation);

      // Now try to send the email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-teacher-invitation', {
          body: {
            email: formData.email.trim().toLowerCase(),
            school: school,
            inviteToken: invitation.invite_token,
          }
        });

        if (emailError) {
          console.error('📧 Email sending failed:', emailError);
          toast({
            title: "⚠️ Invitation Created",
            description: `Invitation created for ${formData.email}, but email sending failed. The invitation token is: ${invitation.invite_token}`,
            variant: "default",
          });
        } else {
          console.log('📧 Email sent successfully');
          toast({
            title: "✅ Invitation Sent Successfully",
            description: `Invitation email sent to ${formData.email}`,
            variant: "default",
          });
        }
      } catch (emailErr: any) {
        console.error('📧 Email function error:', emailErr);
        toast({
          title: "⚠️ Invitation Created",
          description: `Invitation created for ${formData.email}, but email sending failed. The invitation token is: ${invitation.invite_token}`,
          variant: "default",
        });
      }

      // Reset form and notify parent
      setFormData({ email: '', role: 'teacher', specialization: '' });
      onInvitationSent?.();

    } catch (error: any) {
      console.error('💥 Invitation creation failed:', error);
      
      toast({
        title: "❌ Failed to Create Invitation",
        description: error.message || 'An unexpected error occurred',
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
          <Mail className="w-5 h-5" />
          Send Teacher Invitation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="teacher@example.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="doctor">School Psychologist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'doctor' && (
            <div>
              <Label htmlFor="invite-specialization">Specialization (Optional)</Label>
              <Input
                id="invite-specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Child Psychology, Counseling"
                disabled={isLoading}
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Creating Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherInvitationForm;
