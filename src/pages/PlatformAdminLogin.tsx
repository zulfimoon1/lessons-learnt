
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { ShieldIcon, LockIcon } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

const PlatformAdminLogin = () => {
  const [email, setEmail] = useState("zulfimoon1@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { login, admin, isAuthenticated } = usePlatformAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && admin) {
      navigate("/platform-admin");
    }
  }, [isAuthenticated, admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📧 Email:', email);
    console.log('🔐 Password provided:', !!password);
    
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
      console.log('🔄 Calling login function...');
      const result = await login(email.trim(), password);
      console.log('📊 Login result:', result);
      
      if (result.error) {
        console.error('❌ Login failed:', result.error);
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        console.log('✅ Login successful');
        toast({
          title: "Login Successful",
          description: "Welcome to the platform console",
        });
        navigate("/platform-admin");
      }
    } catch (error) {
      console.error('💥 Login form error:', error);
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
    <div className="min-h-screen bg-brand-gradient-soft">
      <CookieConsent />
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <ShieldIcon className="w-12 h-12 text-brand-teal mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-brand-dark">Platform Console</h1>
            <p className="text-gray-600">Admin access to platform management dashboard</p>
          </div>

          <Card className="shadow-xl border-brand-teal/20 bg-white/90">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-1 bg-gray-100">
                  <TabsTrigger value="login" className="flex items-center gap-2 data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                    <LockIcon className="w-4 h-4" />
                    Secure Admin Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-lg text-brand-dark">Platform Administrator</CardTitle>
                    <div className="text-sm text-gray-600">
                      Enhanced security authentication required
                    </div>
                  </CardHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-brand-dark">Admin Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@platform.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-gray-300 focus:border-brand-teal focus:ring-brand-teal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-brand-dark">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-gray-300 focus:border-brand-teal focus:ring-brand-teal"
                      />
                    </div>

                    <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-brand-teal text-sm">
                        <ShieldIcon className="w-4 h-4" />
                        <span className="font-medium">Ready to Login</span>
                      </div>
                      <p className="text-xs text-brand-dark mt-1">
                        Default credentials: zulfimoon1@gmail.com / admin123
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LockIcon className="w-4 h-4" />
                          Secure Login
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-4 text-sm text-gray-500">
            <p>Protected by enhanced security protocols</p>
          </div>
        </div>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default PlatformAdminLogin;
