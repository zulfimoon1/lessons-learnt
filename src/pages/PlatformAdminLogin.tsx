
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { ShieldIcon, LockIcon, ArrowLeft } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PlatformAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-background">
      <CookieConsent />
      
      {/* Header similar to dashboard */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Platform Console</h1>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border bg-card/90">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <LockIcon className="w-4 h-4" />
                    Secure Admin Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <ShieldIcon className="w-5 h-5 text-primary" />
                      Platform Administrator
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Enhanced security authentication required
                    </div>
                  </CardHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Admin Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@platform.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-input focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-input focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-primary text-sm">
                        <ShieldIcon className="w-4 h-4" />
                        <span className="font-medium">Secure Authentication</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact your system administrator for credentials
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
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

          <div className="text-center mt-4 text-sm text-muted-foreground">
            <p>Protected by enhanced security protocols</p>
          </div>
        </div>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default PlatformAdminLogin;
