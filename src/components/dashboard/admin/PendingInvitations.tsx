
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Mail, Clock, CheckCircle } from 'lucide-react';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

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
  const { admin } = usePlatformAdmin();

  const fetchInvitations = async () => {
    try {
      console.log('🔍 Fetching invitations for school:', school);
      
      if (!admin?.email) {
        throw new Error('Platform admin authentication required');
      }

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'list',
          school: school,
          adminEmail: admin.email
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('📨 Fetched invitations:', data.invitations);
      setInvitations(data.invitations || []);
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
      
      if (!admin?.email) {
        throw new Error('Platform admin authentication required');
      }

      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'resend',
          invitationId: invitation.id,
          adminEmail: admin.email
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Resent",
        description: `Invitation resent to ${invitation.email}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: `Failed to resend invitation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [school, refreshTrigger, admin]);

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
                  {invitation.status === 'pending' && new Date(invitation.expires_at) > new Date() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInvitation(invitation)}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Resend
                    </Button>
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
