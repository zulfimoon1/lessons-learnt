
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';

interface TeacherInvitationFormProps {
  school: string;
  onInvitationSent?: () => void;
}

const TeacherInvitationForm: React.FC<TeacherInvitationFormProps> = ({ 
  school, 
  onInvitationSent 
}) => {
  const { teacher } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'teacher',
    specialization: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started', { formData, school, adminEmail: teacher?.email });

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!teacher?.email) {
      toast({
        title: "Error",
        description: "Admin authentication required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📧 Calling manage-invitations edge function...');
      
      const { data: response, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'create',
          email: formData.email.trim().toLowerCase(),
          school: school,
          role: formData.role,
          specialization: formData.specialization || null,
          adminEmail: teacher.email
        }
      });

      console.log('📨 Edge function response:', { response, error });

      // Handle any edge function invocation errors
      if (error) {
        console.error('❌ Edge function invocation error:', error);
        throw new Error(`Function invocation failed: ${error.message || error.toString()}`);
      }

      // Handle the response from the edge function
      if (response && response.success) {
        if (response.emailSent) {
          toast({
            title: "✅ Invitation Sent Successfully",
            description: `Invitation email sent to ${formData.email}`,
            variant: "default",
          });
        } else if (response.invitation) {
          toast({
            title: "⚠️ Invitation Created",
            description: `Invitation created for ${formData.email}, but email sending failed. Please share the invitation link manually.`,
            variant: "default",
          });
        } else {
          toast({
            title: "✅ Invitation Created",
            description: `Invitation created for ${formData.email}`,
            variant: "default",
          });
        }

        // Reset form and notify parent
        setFormData({ email: '', role: 'teacher', specialization: '' });
        onInvitationSent?.();
      } else {
        // Handle error response from the edge function
        const errorMessage = response?.error || 'Failed to create invitation';
        console.error('❌ Edge function returned error:', errorMessage);
        toast({
          title: "❌ Failed to Create Invitation",
          description: errorMessage,
          variant: "destructive",
        });
      }

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
