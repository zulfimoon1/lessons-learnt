
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/student-login');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {student?.full_name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Classes Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-muted-foreground">Upcoming classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Given</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
              <p className="text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{student?.grade}</p>
              <p className="text-muted-foreground">Current grade</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
