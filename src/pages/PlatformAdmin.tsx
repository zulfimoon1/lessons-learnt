
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { createTestAdmin } from "@/services/platformAdminService";
import { ShieldIcon, UserPlusIcon } from "lucide-react";
import ComplianceFooter from "@/components/ComplianceFooter";

const PlatformAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { admin, login, logout } = usePlatformAdmin();
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
          description: "Welcome to the platform admin dashboard",
        });
        setShowDashboard(true);
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

  const handleCreateTestAdmin = async () => {
    setIsCreatingAdmin(true);
    
    try {
      const result = await createTestAdmin();
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Admin Created",
          description: "Email: admin@test.com, Password: admin123",
        });
        setEmail("admin@test.com");
        setPassword("admin123");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test admin",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDashboard(false);
    navigate("/");
  };

  if (admin && showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Platform Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {admin.email}</span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">+5 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">500</div>
                <p className="text-xs text-muted-foreground">+50 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€1,250</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">New school registration</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">Teacher subscription upgrade</span>
                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">Student feedback submitted</span>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server Status</span>
                    <span className="text-sm text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm text-blue-600 font-medium">150ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldIcon className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Platform Admin</CardTitle>
            <CardDescription>
              Sign in to access the platform management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleCreateTestAdmin}
                disabled={isCreatingAdmin}
                className="w-full"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                {isCreatingAdmin ? "Creating..." : "Create Test Admin"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This will create admin@test.com with password admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ComplianceFooter />
    </div>
  );
};

export default PlatformAdmin;
