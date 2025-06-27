
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
      console.log('📤 Calling manage-invitations Edge Function with:', {
        action: 'create',
        email: formData.email,
        school: school,
        role: formData.role,
        specialization: formData.specialization || null,
        adminEmail: admin.email
      });

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'create',
          email: formData.email.trim().toLowerCase(),
          school: school,
          role: formData.role,
          specialization: formData.specialization || null,
          adminEmail: admin.email
        }
      });

      console.log('📥 Edge Function response:', { data, error });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(error.message || 'Failed to send invitation');
      }

      if (!data) {
        throw new Error('No response data received from invitation service');
      }

      // Handle success
      if (data.invitation) {
        if (data.emailSent) {
          toast({
            title: "✅ Invitation Sent Successfully",
            description: `Invitation email sent to ${formData.email}`,
            variant: "default",
          });
        } else {
          toast({
            title: "⚠️ Invitation Created",
            description: `Invitation created for ${formData.email}, but email sending failed. Please share the invitation link manually.`,
            variant: "default",
          });
          console.warn('📧 Email sending failed:', data.emailError);
        }

        // Reset form
        setFormData({ email: '', role: 'teacher', specialization: '' });
        
        // Notify parent component
        onInvitationSent?.();
      } else {
        throw new Error('Invalid response format from invitation service');
      }

    } catch (error: any) {
      console.error('💥 Invitation sending failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'An unexpected error occurred';
      toast({
        title: "❌ Failed to Send Invitation",
        description: errorMessage,
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
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherInvitationForm;
