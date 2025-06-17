
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AuthTestComponent from "@/components/AuthTestComponent";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Lesson Lens
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering educators with student feedback and insights
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/student-login">Student Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/teacher-login">Teacher Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/console">Platform Console</Link>
            </Button>
          </div>
        </div>

        {/* Authentication Testing Panel */}
        <div className="max-w-4xl mx-auto">
          <AuthTestComponent />
        </div>
      </div>
    </div>
  );
};

export default Index;
