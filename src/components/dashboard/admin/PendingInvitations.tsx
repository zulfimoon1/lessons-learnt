
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Mail, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Invitation {
  id: string;
  email: string;
  role: string;
  specialization?: string;
  status: string;
  created_at: string;
  expires_at: string;
  school: string;
  invite_token: string;
}

interface PendingInvitationsProps {
  school: string;
  refreshTrigger?: number;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ 
  school, 
  refreshTrigger 
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { teacher } = useAuth();

  const fetchInvitations = async () => {
    try {
      console.log('🔍 Fetching invitations for school:', school);
      
      if (!teacher?.email) {
        throw new Error('Teacher authentication required');
      }

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'list',
          school: school,
          adminEmail: teacher.email
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('📨 Fetched invitations:', data);
      
      if (data && data.success) {
        setInvitations(data.invitations || []);
      } else {
        console.error('Failed to fetch invitations:', data?.error);
        toast({
          title: "Error",
          description: data?.error || 'Failed to fetch invitations',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: `Failed to fetch invitations: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      console.log('📧 Resending invitation to:', invitation.email);
      
      if (!teacher?.email) {
        throw new Error('Teacher authentication required');
      }

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'resend',
          invitationId: invitation.id,
          adminEmail: teacher.email
        }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "Invitation Resent",
          description: `Invitation resent to ${invitation.email}`,
          variant: "default",
        });
      } else {
        throw new Error(data?.error || 'Failed to resend invitation');
      }
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: `Failed to resend invitation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (invitation: Invitation) => {
    try {
      console.log('🗑️ Deleting invitation:', invitation.id);
      
      if (!teacher?.email) {
        throw new Error('Teacher authentication required');
      }

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'delete',
          invitationId: invitation.id,
          adminEmail: teacher.email
        }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "Invitation Deleted",
          description: `Invitation for ${invitation.email} has been deleted`,
          variant: "default",
        });
        // Refresh the list
        fetchInvitations();
      } else {
        throw new Error(data?.error || 'Failed to delete invitation');
      }
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: `Failed to delete invitation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [school, refreshTrigger, teacher]);

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
    } else if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Loading Invitations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Invitations ({invitations.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchInvitations}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No invitations sent yet.
            </p>
          ) : (
            invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{invitation.email}</h4>
                  <p className="text-sm text-muted-foreground">
                    {invitation.role === 'doctor' ? 'Psychologist' : 'Teacher'}
                    {invitation.specialization && ` • ${invitation.specialization}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sent: {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invitation.status, invitation.expires_at)}
                  {invitation.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation(invitation)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Resend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInvitation(invitation)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitations;
