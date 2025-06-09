import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid invitation",
        description: "No invitation token provided",
        variant: "destructive",
      });
      navigate('/teacher-login');
      return;
    }
    
    loadInvitation();
  }, [token, navigate]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();

      if (error) {
        console.error('Error loading invitation:', error);
        toast({
          title: "Invalid invitation",
          description: "This invitation link is invalid or has expired",
          variant: "destructive",
        });
        navigate('/teacher-login');
        return;
      }

      // Check if invitation has expired
      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Invitation expired",
          description: "This invitation has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/teacher-login');
        return;
      }

      setInvitation(data);
      setFormData(prev => ({
        ...prev,
        email: data.email
      }));
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        title: "Error",
        description: "Failed to load invitation details",
        variant: "destructive",
      });
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create teacher profile
      const { data: newTeacher, error: teacherError } = await supabase
        .from('teacher_profiles')
        .insert({
          id: crypto.randomUUID(),
          name: formData.name.trim(),
          email: formData.email,
          school: invitation.school,
          role: invitation.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (teacherError) {
        console.error('Error creating teacher:', teacherError);
        toast({
          title: "Registration failed",
          description: "Failed to create teacher account",
          variant: "destructive",
        });
        return;
      }

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      });

      navigate('/teacher-login');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">Accept Invitation</CardTitle>
          <CardDescription>Create your account to join Lesson Lens</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                value={formData.email}
                onChange={() => {}}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
