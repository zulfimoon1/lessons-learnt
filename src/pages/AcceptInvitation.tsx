
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SchoolIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import bcrypt from 'bcryptjs';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "This invitation link is invalid or missing required parameters.",
        variant: "destructive",
      });
      navigate('/teacher-login');
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      console.log('Loading invitation with token:', token);

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        console.error('Invitation not found:', error);
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid, expired, or has already been used.",
          variant: "destructive",
        });
        navigate('/teacher-login');
        return;
      }

      // Check if invitation has expired
      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Invitation Expired",
          description: "This invitation has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/teacher-login');
        return;
      }

      console.log('Invitation loaded:', data);
      setInvitation(data);
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        title: "Error",
        description: "Failed to load invitation details.",
        variant: "destructive",
      });
      navigate('/teacher-login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);
    try {
      console.log('Accepting invitation for:', invitation.email);

      // Hash the password
      const passwordHash = await bcrypt.hash(formData.password, 10);

      // Create teacher account
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          name: formData.name.trim(),
          email: invitation.email,
          password_hash: passwordHash,
          school: invitation.school,
          role: invitation.role,
        })
        .select()
        .single();

      if (teacherError) {
        console.error('Error creating teacher:', teacherError);
        throw teacherError;
      }

      console.log('Teacher created:', teacher);

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      toast({
        title: "Account Created",
        description: "Your teacher account has been created successfully! You can now log in.",
        variant: "default",
      });

      navigate('/teacher-login');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: `Failed to create account: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/teacher-login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <SchoolIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <CardTitle>Join {invitation.school}</CardTitle>
            <CardDescription>
              You've been invited to join {invitation.school} as a teacher. 
              Complete your registration below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={invitation.school}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Choose a password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" disabled={isAccepting} className="w-full">
                {isAccepting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/teacher-login')}
                  className="p-0 h-auto"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation;
