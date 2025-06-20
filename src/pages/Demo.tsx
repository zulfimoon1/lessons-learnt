import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  Heart,
  Shield,
  Zap,
  Star
} from "lucide-react";

const Demo = () => {
  const [isDemoActive, setIsDemoActive] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Experience Lesson Lens in Demo Mode
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore the platform's features and benefits without any commitment.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                  <GraduationCap className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Engaging Lesson Feedback
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Collect real-time feedback from students to improve your teaching methods.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Simplified Class Management
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Easily manage class schedules, student lists, and communication in one place.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                  <BarChart3 className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Insightful Analytics
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Gain valuable insights into student performance and overall class progress.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-yellow-600 text-white">
                  <MessageSquare className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Direct Communication
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Facilitate seamless communication between teachers, students, and parents.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                  <Heart className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Mental Health Support
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Tools and resources to support student mental health and well-being.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-600 text-white">
                  <Shield className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Enhanced Security
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Protect student data with advanced security measures and compliance features.
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => setIsDemoActive(!isDemoActive)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full"
          >
            {isDemoActive ? 'Exit Demo Mode' : 'Enter Demo Mode'}
          </Button>
        </div>

        {isDemoActive && (
          <div className="mt-12">
            <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="px-4 py-5 sm:px-6">
                <CardTitle className="text-lg font-medium text-gray-900">
                  Demo Mode Activated
                  <Badge className="ml-2 bg-green-500 text-white">
                    <Zap className="h-4 w-4 mr-1" />
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  You are now experiencing Lesson Lens in demo mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-gray-50 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <h3 className="text-md font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 mr-1 inline-block" />
                      Explore Scheduling
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Create and manage class schedules with ease.
                    </p>
                  </div>
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <h3 className="text-md font-semibold text-gray-700">
                      <BookOpen className="h-4 w-4 mr-1 inline-block" />
                      View Sample Lessons
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Access pre-built lesson plans and resources.
                    </p>
                  </div>
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <h3 className="text-md font-semibold text-gray-700">
                      <Star className="h-4 w-4 mr-1 inline-block" />
                      Test Feedback System
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Simulate student feedback and analyze results.
                    </p>
                  </div>
                  <div className="bg-white rounded-md shadow-sm p-4">
                    <h3 className="text-md font-semibold text-gray-700">
                      <Users className="h-4 w-4 mr-1 inline-block" />
                      Manage Demo Students
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add, edit, or remove demo student accounts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
