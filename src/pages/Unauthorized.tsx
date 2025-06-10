
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldXIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <ShieldXIcon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Please check that you're logged in with the correct account type and have the necessary permissions.
          </p>
          <div className="flex flex-col space-y-2">
            <Link to="/">
              <Button className="w-full">Go Home</Button>
            </Link>
            <Link to="/teacher-login">
              <Button variant="outline" className="w-full">Teacher Login</Button>
            </Link>
            <Link to="/student-login">
              <Button variant="outline" className="w-full">Student Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
