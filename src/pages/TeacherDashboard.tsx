
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  LogOutIcon,
  CreditCardIcon
} from "lucide-react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  current_period_end: string;
}

const TeacherDashboard = () => {
  const { teacher, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (!teacher) {
      navigate('/teacher-login');
      return;
    }
    loadSubscription();
  }, [teacher, navigate]);

  const loadSubscription = async () => {
    if (!teacher?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher-login');
  };

  const handleCreateCheckout = async () => {
    if (!teacher?.email || !teacher?.school) {
      toast({
        title: "Error",
        description: "Missing teacher information",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCheckout(true);
    try {
      console.log('Creating checkout session for teacher:', teacher.email);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          email: teacher.email,
          school_name: teacher.school,
          plan_type: 'monthly',
          amount: 2999, // $29.99
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: `Failed to create checkout session: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground">Welcome, {teacher?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {!subscription && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <CreditCardIcon className="w-5 h-5" />
                Subscription Required
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Subscribe to unlock all features and start creating class schedules for {teacher?.school}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateCheckout}
                disabled={isCreatingCheckout}
                className="bg-primary hover:bg-primary/90"
              >
                {isCreatingCheckout ? 'Creating Session...' : 'Subscribe Now - $29.99/month'}
              </Button>
            </CardContent>
          </Card>
        )}

        {subscription && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Active Subscription</CardTitle>
              <CardDescription className="text-green-700">
                Your {subscription.plan_type} plan is active until {new Date(subscription.current_period_end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School</CardTitle>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{teacher?.school}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">{teacher?.role}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {subscription ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {subscription ? (
              <ClassScheduleForm teacher={teacher} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                  <CardDescription>
                    Subscribe to start creating and managing class schedules
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Class scheduling is available with an active subscription</p>
                  <Button 
                    onClick={handleCreateCheckout}
                    disabled={isCreatingCheckout}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isCreatingCheckout ? 'Creating Session...' : 'Subscribe to Continue'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
