
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { ShieldIcon } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import TabNavigation from "@/components/platform-admin/TabNavigation";
import AdminLoginTab from "@/components/platform-admin/AdminLoginTab";
import AdminSignupTab from "@/components/platform-admin/AdminSignupTab";

const PlatformAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const { login } = usePlatformAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting login form');
      const result = await login(email, password);
      
      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to the platform console",
        });
        navigate("/platform-admin");
      }
    } catch (error) {
      console.error('Login form error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <CookieConsent />
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <ShieldIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Platform Console</h1>
            <p className="text-gray-600">Admin access to platform management dashboard</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

              {activeTab === 'login' && (
                <AdminLoginTab
                  email={email}
                  password={password}
                  isLoading={isLoading}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handleSubmit}
                />
              )}

              {activeTab === 'create' && <AdminSignupTab />}
            </CardContent>
          </Card>
        </div>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default PlatformAdminLogin;
