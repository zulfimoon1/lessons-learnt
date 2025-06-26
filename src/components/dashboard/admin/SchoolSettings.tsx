
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, CreditCard, School, Users, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SchoolSettingsProps {
  teacher: any;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [schoolInfo, setSchoolInfo] = useState({
    name: teacher.school,
    description: '',
    contact_email: teacher.email,
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionInfo();
  }, [teacher]);

  const loadSubscriptionInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      } else {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { school: teacher.school }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to access subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Settings</h2>
            <p className="text-gray-600">
              Manage your school configuration and subscription
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Management */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Subscription</CardTitle>
                <CardDescription className="text-sm">Manage your billing and plan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionInfo ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={subscriptionInfo.status === 'active' ? 'default' : 'secondary'}>
                    {subscriptionInfo.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="text-sm font-medium">{subscriptionInfo.plan_type || 'Standard'}</span>
                </div>
                {subscriptionInfo.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next billing:</span>
                    <span className="text-sm font-medium">
                      {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active subscription found</p>
            )}
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </CardContent>
        </Card>

        {/* School Information */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                <School className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">School Information</CardTitle>
                <CardDescription className="text-sm">View your school details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                value={schoolInfo.name}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Admin Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={schoolInfo.contact_email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="text-sm text-gray-500">
              Contact support to update school information
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">System Configuration</CardTitle>
          <CardDescription>Additional school-wide settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Users className="w-8 h-8 text-brand-teal mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">User Management</h4>
              <p className="text-sm text-gray-500 mt-1">Manage teachers and students</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Calendar className="w-8 h-8 text-brand-orange mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Academic Calendar</h4>
              <p className="text-sm text-gray-500 mt-1">Set term dates and holidays</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Data Privacy</h4>
              <p className="text-sm text-gray-500 mt-1">GDPR and privacy settings</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Additional configuration options will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolSettings;
